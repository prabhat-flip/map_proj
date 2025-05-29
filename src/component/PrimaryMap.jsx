import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const paragraphStyle = {
	fontFamily: "Open Sans",
	margin: 0,
	fontSize: 13,
};

const PrimaryMap = () => {
	const mapContainerRef = useRef();
	const mapRef = useRef();
	const drawRef = useRef();
	const fileInputRef = useRef();
	const [roundedArea, setRoundedArea] = useState();
	const [markers, setMarkers] = useState([]);
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [isMobile, setIsMobile] = useState(false);
	const [currentMode, setCurrentMode] = useState("marker");
	const [modeChangeIndicator, setModeChangeIndicator] = useState("");

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth <= 768;
			setIsMobile(mobile);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		loadFromLocalStorage();
	}, []);

	useEffect(() => {
		saveToLocalStorage();
	}, [markers, roundedArea, currentMode]);

	const changeMode = (mode) => {
		setCurrentMode(mode);

		if (drawRef.current) {
			if (mode === "marker") {
				// Switch to simple_select mode for marker placement
				drawRef.current.changeMode("simple_select");
			} else if (mode === "polygon") {
				// Switch to draw_polygon mode for drawing polygons
				drawRef.current.changeMode("draw_polygon");
			}
		}

		// Optional: Show a brief indicator of mode change
		setModeChangeIndicator(mode);
		setTimeout(() => setModeChangeIndicator(""), 1000);
	};

	useEffect(() => {
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: "mapbox://styles/mapbox/satellite-streets-v12",
			center: [77.209, 28.6139],
			zoom: 12,
		});

		mapRef.current.on("load", () => {
			const draw = new MapboxDraw({
				displayControlsDefault: false,
				controls: {
					polygon: true,
					trash: true,
				},
				defaultMode: "simple_select", // Start in simple_select for marker mode
			});
			drawRef.current = draw;

			mapRef.current.addControl(draw);
			mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

			mapRef.current.on("draw.create", updateArea);
			mapRef.current.on("draw.delete", updateArea);
			mapRef.current.on("draw.update", updateArea);

			mapRef.current.on("click", (e) => {
				const currentDrawMode = draw.getMode();
				// Only add markers when in simple_select mode (marker mode)
				if (currentDrawMode === "simple_select" && currentMode === "marker") {
					addMarker(e.lngLat.lng, e.lngLat.lat);
				}
			});

			function updateArea(e) {
				const data = draw.getAll();
				if (data.features.length > 0) {
					const area = turf.area(data);
					setRoundedArea(Math.round(area * 100) / 100);
				} else {
					setRoundedArea();
				}
			}

			// Load saved polygons
			loadSavedPolygons();

			// Set initial mode after a small delay to ensure draw is ready
			setTimeout(() => {
				changeMode(currentMode);
			}, 100);
		});

		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
			}
		};
	}, []);

	const addMarker = (lng, lat) => {
		const markerId = Date.now();

		const markerElement = document.createElement("div");
		markerElement.innerHTML = "📍";
		markerElement.style.fontSize = "24px";
		markerElement.style.cursor = "pointer";

		const mapboxMarker = new mapboxgl.Marker(markerElement).setLngLat([lng, lat]).addTo(mapRef.current);

		markerElement.addEventListener("click", () => {
			setSelectedMarker(markerId);
		});

		const newMarker = {
			id: markerId,
			lng: lng,
			lat: lat,
			mapboxMarker: mapboxMarker,
		};

		setMarkers((prev) => [...prev, newMarker]);
	};

	const removeMarker = (markerId) => {
		setMarkers((prev) => {
			const markerToRemove = prev.find((m) => m.id === markerId);
			if (markerToRemove) {
				markerToRemove.mapboxMarker.remove();
			}
			return prev.filter((m) => m.id !== markerId);
		});
		setSelectedMarker(null);
	};

	const clearAll = () => {
		// Clear all markers
		markers.forEach((marker) => {
			marker.mapboxMarker.remove();
		});
		setMarkers([]);
		setSelectedMarker(null);

		// Clear all polygons
		if (drawRef.current) {
			drawRef.current.deleteAll();
		}
		setRoundedArea();

		// Reset to marker mode
		setCurrentMode("marker");
		changeMode("marker");

		// Clear localStorage
		localStorage.removeItem("mapState");
	};

	//  localStorage
	const saveToLocalStorage = () => {
		try {
			const polygons = drawRef.current ? drawRef.current.getAll() : { features: [] };
			const mapState = {
				markers: markers.map((m) => ({ id: m.id, lng: m.lng, lat: m.lat })),
				polygons: polygons,
				area: roundedArea,
				currentMode: currentMode,
				timestamp: Date.now(),
			};
			localStorage.setItem("mapState", JSON.stringify(mapState));
		} catch (error) {
			console.error("Error saving to localStorage:", error);
		}
	};

	// Load   localStorage
	const loadFromLocalStorage = () => {
		try {
			const saved = localStorage.getItem("mapState");
			if (saved) {
				const mapState = JSON.parse(saved);

				// Load markers
				if (mapState.markers) {
					mapState.markers.forEach((markerData) => {
						setTimeout(() => {
							addMarker(markerData.lng, markerData.lat);
						}, 100);
					});
				}

				// Set area
				if (mapState.area) {
					setRoundedArea(mapState.area);
				}

				// Set mode
				if (mapState.currentMode) {
					setCurrentMode(mapState.currentMode);
				}
			}
		} catch (error) {
			console.error("Error loading from localStorage:", error);
		}
	};

	//   saved polygons
	const loadSavedPolygons = () => {
		try {
			const saved = localStorage.getItem("mapState");
			if (saved && drawRef.current) {
				const mapState = JSON.parse(saved);
				if (mapState.polygons && mapState.polygons.features.length > 0) {
					drawRef.current.set(mapState.polygons);
				}
			}
		} catch (error) {
			console.error("Error loading polygons:", error);
		}
	};

	// Export as GeoJSON
	const exportGeoJSON = () => {
		try {
			const polygons = drawRef.current ? drawRef.current.getAll() : { features: [] };
			const markersGeoJSON = {
				type: "FeatureCollection",
				features: markers.map((marker) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [marker.lng, marker.lat],
					},
					properties: {
						id: marker.id,
						type: "marker",
					},
				})),
			};

			const combined = {
				type: "FeatureCollection",
				features: [
					...markersGeoJSON.features,
					...polygons.features.map((feature) => ({
						...feature,
						properties: { ...feature.properties, type: "polygon" },
					})),
				],
			};

			const dataStr = JSON.stringify(combined, null, 2);
			const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

			const exportFileDefaultName = `map-data-${new Date().toISOString().split("T")[0]}.geojson`;

			const linkElement = document.createElement("a");
			linkElement.setAttribute("href", dataUri);
			linkElement.setAttribute("download", exportFileDefaultName);
			linkElement.click();
		} catch (error) {
			console.error("Error exporting GeoJSON:", error);
			alert("Error exporting data");
		}
	};

	// Import GeoJSON
	const importGeoJSON = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const geojson = JSON.parse(e.target.result);

				// Clear existing data
				clearAll();

				// Process features
				if (geojson.features) {
					geojson.features.forEach((feature) => {
						if (feature.geometry.type === "Point") {
							// Add marker
							const [lng, lat] = feature.geometry.coordinates;
							setTimeout(() => addMarker(lng, lat), 100);
						} else if (feature.geometry.type === "Polygon") {
							// Add polygon to draw
							if (drawRef.current) {
								drawRef.current.add(feature);
							}
						}
					});
				}

				alert("GeoJSON imported successfully!");
			} catch (error) {
				console.error("Error importing GeoJSON:", error);
				alert("Error importing GeoJSON file");
			}
		};
		reader.readAsText(file);
		event.target.value = ""; // Reset file input
	};

	const mapWidth = isMobile ? "100%" : "calc(100vw - 320px)";

	return (
		<>
			<div
				ref={mapContainerRef}
				id="map"
				style={{
					height: "100vh",
					width: mapWidth,
				}}
			/>

			{!isMobile && (
				<div
					style={{
						position: "fixed",
						right: 0,
						top: 0,
						width: "320px",
						height: "100vh",
						backgroundColor: "rgba(255, 255, 255, 0.98)",
						padding: "20px",
						overflowY: "auto",
						boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
						zIndex: 100,
					}}
				>
					<h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "bold" }}>Map Controls</h3>

					{/* Mode Selection */}
					<div style={{ marginBottom: "20px" }}>
						<h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>Select Mode</h4>
						<div style={{ display: "flex", gap: "10px" }}>
							<button
								onClick={() => changeMode("marker")}
								style={{
									flex: "1",
									padding: "8px 12px",
									backgroundColor: currentMode === "marker" ? "#2196f3" : "#f5f5f5",
									color: currentMode === "marker" ? "white" : "#333",
									border: currentMode === "marker" ? "none" : "1px solid #ddd",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "12px",
									fontWeight: currentMode === "marker" ? "bold" : "normal",
									transition: "all 0.2s ease",
								}}
							>
								📍 Add Markers
							</button>
							<button
								onClick={() => changeMode("polygon")}
								style={{
									flex: "1",
									padding: "8px 12px",
									backgroundColor: currentMode === "polygon" ? "#2196f3" : "#f5f5f5",
									color: currentMode === "polygon" ? "white" : "#333",
									border: currentMode === "polygon" ? "none" : "1px solid #ddd",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "12px",
									fontWeight: currentMode === "polygon" ? "bold" : "normal",
									transition: "all 0.2s ease",
								}}
							>
								🔺 Draw Polygons
							</button>
						</div>
						<div
							style={{
								marginTop: "8px",
								padding: "8px",
								backgroundColor: currentMode === "marker" ? "#e3f2fd" : "#fff3e0",
								borderRadius: "4px",
								border: `1px solid ${currentMode === "marker" ? "#2196f3" : "#ff9800"}`,
							}}
						>
							<p
								style={{
									...paragraphStyle,
									fontSize: "12px",
									color: "#333",
									fontWeight: "bold",
									margin: 0,
								}}
							>
								🎯{" "}
								{currentMode === "marker"
									? "MARKER MODE: Click map to place pins"
									: "POLYGON MODE: Click to draw shapes"}
							</p>
						</div>
					</div>

					{/* Control Buttons */}
					<div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
						{currentMode === "polygon" && (
							<button
								onClick={() => {
									if (drawRef.current) {
										const mode = drawRef.current.getMode();
										if (mode === "draw_polygon") {
											// Finish current polygon
											drawRef.current.changeMode("simple_select");
											setTimeout(() => {
												drawRef.current.changeMode("draw_polygon");
											}, 100);
										}
									}
								}}
								style={{
									flex: "1",
									minWidth: "120px",
									padding: "8px 12px",
									backgroundColor: "#FF9800",
									color: "white",
									border: "none",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "12px",
									fontWeight: "bold",
								}}
							>
								Finish Polygon
							</button>
						)}

						<button
							onClick={clearAll}
							style={{
								flex: "1",
								minWidth: "120px",
								padding: "10px 12px",
								backgroundColor: "#ff4444",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
								fontWeight: "bold",
							}}
						>
							Clear All
						</button>

						<button
							onClick={exportGeoJSON}
							style={{
								flex: "1",
								minWidth: "120px",
								padding: "10px 12px",
								backgroundColor: "#4CAF50",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
							}}
						>
							Export GeoJSON
						</button>
					</div>

					{/* Import GeoJSON */}
					<div style={{ marginBottom: "10px" }}>
						<button
							onClick={() => fileInputRef.current?.click()}
							style={{
								width: "100%",
								padding: "10px 15px",
								backgroundColor: "#2196F3",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "14px",
							}}
						>
							Import GeoJSON
						</button>
					</div>

					{/* Markers Section */}
					<div style={{ marginBottom: "20px" }}>
						<h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>
							Markers ({markers.length})
						</h4>

						{markers.length === 0 ? (
							<p style={paragraphStyle}>Click on the map to add markers</p>
						) : (
							<div style={{ maxHeight: "300px", overflowY: "auto" }}>
								{markers.map((marker) => (
									<div
										key={marker.id}
										style={{
											padding: "8px",
											marginBottom: "8px",
											backgroundColor: selectedMarker === marker.id ? "#e3f2fd" : "#f5f5f5",
											borderRadius: "5px",
											border:
												selectedMarker === marker.id ? "2px solid #2196f3" : "1px solid #ddd",
											cursor: "pointer",
											fontSize: "13px",
										}}
										onClick={() => setSelectedMarker(marker.id)}
									>
										<div style={{ ...paragraphStyle, fontWeight: "bold" }}>
											📍 #{marker.id.toString().slice(-4)}
										</div>
										<div style={paragraphStyle}>
											{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												removeMarker(marker.id);
											}}
											style={{
												marginTop: "5px",
												padding: "2px 8px",
												fontSize: "10px",
												backgroundColor: "#ff4444",
												color: "white",
												border: "none",
												borderRadius: "3px",
												cursor: "pointer",
											}}
										>
											Remove
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Polygon Section */}
					<div style={{ marginBottom: "20px" }}>
						<h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>Polygon Area</h4>
						<div
							style={{
								padding: "12px",
								backgroundColor: "#f5f5f5",
								borderRadius: "5px",
								textAlign: "center",
							}}
						>
							{roundedArea ? (
								<>
									<p
										style={{
											...paragraphStyle,
											fontWeight: "bold",
											fontSize: "16px",
											color: "#2196f3",
										}}
									>
										{roundedArea.toLocaleString()}
									</p>
									<p style={paragraphStyle}>square meters</p>
								</>
							) : (
								<p style={paragraphStyle}>Draw a polygon to see area</p>
							)}
						</div>
					</div>

					{/* Instructions */}
					<div>
						<h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>How to Use</h4>
						<div style={{ fontSize: "11px", lineHeight: "1.4", color: "#666" }}>
							{currentMode === "marker" ? (
								<>
									<strong>📍 MARKER MODE (Active):</strong>
									<br />
									• Click anywhere on the map to add markers
									<br />
									• Click markers in the list to highlight them
									<br />
									• Use "Remove" button to delete markers
									<br />
									<br />
									<em>💡 Switch to Polygon mode to draw shapes</em>
								</>
							) : (
								<>
									<strong>🔺 POLYGON MODE (Active):</strong>
									<br />
									• Click on map to start drawing
									<br />
									• Keep clicking to add points
									<br />
									• Double-click OR use "Finish Polygon" to complete
									<br />
									• Use trash tool (🗑️) to delete polygons
									<br />
									<br />
									<em>💡 Switch to Marker mode to place pins</em>
								</>
							)}
							<br />
							<strong>💾 Auto-Save:</strong> Your work is saved automatically
							<br />
							<strong>📁 Files:</strong> Import/Export GeoJSON data
						</div>
					</div>
				</div>
			)}

			<input
				ref={fileInputRef}
				type="file"
				accept=".geojson,.json"
				onChange={importGeoJSON}
				style={{ display: "none" }}
			/>

			{isMobile && (
				<>
					<div
						style={{
							position: "fixed",
							top: "20px",
							left: "20px",
							right: "20px",
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							padding: "12px",
							borderRadius: "8px",
							boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
							zIndex: 1000,
						}}
					>
						<div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
							<button
								onClick={() => changeMode("marker")}
								style={{
									flex: "1",
									padding: "8px 12px",
									backgroundColor: currentMode === "marker" ? "#2196f3" : "#f5f5f5",
									color: currentMode === "marker" ? "white" : "#333",
									border: "none",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "12px",
									fontWeight: currentMode === "marker" ? "bold" : "normal",
									transition: "all 0.2s ease",
								}}
							>
								📍 Markers
							</button>
							<button
								onClick={() => changeMode("polygon")}
								style={{
									flex: "1",
									padding: "8px 12px",
									backgroundColor: currentMode === "polygon" ? "#2196f3" : "#f5f5f5",
									color: currentMode === "polygon" ? "white" : "#333",
									border: "none",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "12px",
									fontWeight: currentMode === "polygon" ? "bold" : "normal",
									transition: "all 0.2s ease",
								}}
							>
								🔺 Polygons
							</button>
						</div>
						<div
							style={{
								fontSize: "10px",
								textAlign: "center",
								color: "#666",
								fontWeight: "bold",
							}}
						>
							{currentMode === "marker" ? "👆 Tap map to place markers" : "👆 Tap to draw polygons"}
						</div>
					</div>

					<div
						style={{
							position: "fixed",
							bottom: "20px",
							left: "20px",
							right: "20px",
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							padding: "15px",
							borderRadius: "10px",
							boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
							zIndex: 1000,
							display: "flex",
							gap: "10px",
							flexWrap: "wrap",
						}}
					>
						<button
							onClick={clearAll}
							style={{
								flex: "1",
								minWidth: "80px",
								padding: "8px 12px",
								backgroundColor: "#ff4444",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
							}}
						>
							Clear All
						</button>

						<button
							onClick={exportGeoJSON}
							style={{
								flex: "1",
								minWidth: "80px",
								padding: "8px 12px",
								backgroundColor: "#4CAF50",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
							}}
						>
							Export
						</button>

						<button
							onClick={() => fileInputRef.current?.click()}
							style={{
								flex: "1",
								minWidth: "80px",
								padding: "8px 12px",
								backgroundColor: "#2196F3",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
							}}
						>
							Import
						</button>
					</div>
				</>
			)}
		</>
	);
};

export default PrimaryMap;
