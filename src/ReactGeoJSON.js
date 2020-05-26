import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function ReactGeoJSON({
  apiKey,
  center = {},
  zoom = 10,
  existingArea = null,
  areaStyles = {},
  onSave = () => {},
  mapStyles = [],
}) {
  const [map, setMap] = useState(false);
  const mapRef = useRef(null);
  const polygons = useRef([]);
  const activePolygon = useRef(null);
  const listenersEnabled = useRef(false);
  const selectedPolygon = useRef(null);
  const polygonBeingAdded = useRef(null);
  const selectedInfoWindow = useRef(null);
  const [polygonSelected, setPolygonSelected] = useState(false);

  const activeDrawingSet = useRef([]);
  const [activeDrawing, setActiveDrawing] = useState([]);
  const identifier = useRef(Math.random().toString(36).substring(4));

  function mapInitiated() {
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      disableDefaultUI: true,
      clickableIcons: false,
      mapStyles,
    });

    map.addListener('click', onMapClick);

    setMap(map);
  }

  function onMapClick() {
    if (polygonBeingAdded.current === null) {
      deselect();
    }
  }

  // Draw polygons that have been specified in the initial dataset
  const drawPolygon = useCallback(
    (coords, name = null) => {
      if (map === false) return;

      var polygon = new google.maps.Polygon({
        paths: coords,
        editable: false,
        ...areaStyles,
      });

      polygon.setMap(map);

      polygons.current.push(polygon);

      let center = null;
      let infoWindow = null;

      if (name) {
        center = { lat: 0, lng: 0 };
        coords.forEach((coord) => {
          center.lat += coord.lat;
          center.lng += coord.lng;
        });

        center.lat = center.lat / coords.length;
        center.lng = center.lng / coords.length;

        infoWindow = new google.maps.InfoWindow({
          content: name,
        });
      }

      polygon.addListener('click', () =>
        onPolygonClick(polygon, { infoWindow, center })
      );
    },
    [map]
  );

  function deselect() {
    setPolygonSelected(false);

    if (selectedPolygon.current !== null) {
      selectedPolygon.current.setEditable(false);
    }

    if (selectedInfoWindow.current !== null) {
      selectedInfoWindow.current.close();
    }

    if (polygonBeingAdded.current !== null) {
      polygonBeingAdded.current.setEditable(false);
    }
  }

  function onPolygonClick(polygon, opts) {
    deselect();
    setPolygonSelected(true);

    polygon.setEditable(true);

    selectedPolygon.current = polygon;
    selectedInfoWindow.current = null;

    if (opts.infoWindow && opts.center) {
      selectedInfoWindow.current = opts.infoWindow;
      opts.infoWindow.setPosition(opts.center);
      opts.infoWindow.open(map);
    }
  }

  // Get the right coords from a feature and flatten them to make working with them easier
  function getCoordsFromFeature(feature) {
    return feature.geometry.coordinates
      .map((c) => {
        if (typeof c.lat !== 'undefined') return c;
        if (c.length === 2) return { lat: c[1], lng: c[0] };
        return (
          c &&
          c.map((latLng) => {
            if (Array.isArray(latLng))
              return { lat: latLng[1], lng: latLng[0] };
            return { lat: latLng.lat, lng: latLng.lng };
          })
        );
      })
      .flat(2);
  }

  // If an existing area exists, add it to the map
  useEffect(() => {
    if (map === false) return;
    if (existingArea === null || typeof existingArea.features === 'undefined') {
      return;
    }

    existingArea.features.forEach((feature) => {
      const coords = getCoordsFromFeature(feature);
      drawPolygon(coords, feature.properties.Name);
    });
  }, [map, existingArea]);

  // Adding a new point to the active drawing set
  function addNewPoint(e) {
    activeDrawingSet.current.push({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });

    activePolygon.current.setPath(activeDrawingSet.current);
    setActiveDrawing([...activeDrawingSet.current]);
  }

  function removeLastPoint(e) {
    activeDrawingSet.current.pop();
    activePolygon.current.setPath(activeDrawingSet.current);
    setActiveDrawing([...activeDrawingSet.current]);
  }

  function undo(e) {
    if (e.which === 90 && (e.ctrlKey || e.metaKey)) {
      removeLastPoint();
    }
  }

  const addListeners = useCallback(() => {
    listenersEnabled.current = true;

    map.addListener('click', addNewPoint);
    document.addEventListener('keydown', undo);
  }, [map]);

  // Load the external google maps script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=ReactGeoJSONInit${identifier.current}`;
    script.defer = true;
    script.async = true;

    window[`ReactGeoJSONInit${identifier.current}`] = mapInitiated;
    document.head.appendChild(script);

    return function cleanup() {
      document.head.removeChild(script);
    };
  }, []);

  function startEditing() {
    deselect();

    activeDrawingSet.current = [];
    setActiveDrawing([]);

    activePolygon.current = new google.maps.Polygon({
      editable: true,
      ...areaStyles,
    });

    activePolygon.current.addListener('click', onPolygonClick);

    activePolygon.current.setMap(map);
    polygons.current.push(activePolygon.current);
    polygonBeingAdded.current = activePolygon.current;

    setPolygonSelected(true);

    if (listenersEnabled.current === false) {
      addListeners();
    }
  }

  function removeSelectedPolygon() {
    if (selectedPolygon.current !== null) {
      for (let i = 0; i < polygons.current.length; i++) {
        if (polygons.current[i] === selectedPolygon.current) {
          polygons.current.splice(i, 1);
          setPolygonSelected(false);
          return selectedPolygon.current.setMap(null);
        }
      }
    }
  }

  function saveCurrentDrawing() {
    deselect();
    if (polygons.current.length === 0) return;
    const areas = [];
    polygons.current.forEach((polygon) => {
      const p = polygon.getPath();
      if (typeof p === 'undefined') return;

      areas.push(
        p.getArray().map((area) => ({ lat: area.lat(), lng: area.lng() }))
      );
    });

    const feature = (coordinates) => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: coordinates,
      },
    });

    const data = {
      type: 'FeatureCollection',
      features: areas.map(feature),
    };

    onSave(data);
  }

  const Action = ({ children, ...rest }) => (
    <button
      style={{
        border: 0,
        padding: 15,
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
      {...rest}
    >
      {children}
    </button>
  );

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div style={{ height: '100%', width: '100%' }} ref={mapRef} />
      <span style={{ position: 'absolute', bottom: 20, right: 5, zIndex: 900 }}>
        {activeDrawing && activeDrawing.length > 0 && (
          <Action onClick={removeLastPoint}>undo</Action>
        )}
        {polygonSelected && (
          <Action onClick={removeSelectedPolygon}>remove</Action>
        )}
        <Action onClick={startEditing}>+</Action>
        <Action onClick={saveCurrentDrawing}>save</Action>
      </span>
    </div>
  );
}