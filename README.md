# react-geojson

A (P)React component to render a Google Maps map with the possibility to add polygons (or view/edit existing polygons).

### Installation

To install React GeoJSON run `npm i react-geojson` in your project

### Usage

```
import ReactGeoJSON from 'react-geojson';

...

<ReactGeoJSON
  apiKey="..."
  onMapInitiated={(map) => console.log('Map initiated', map)}
  onPolygonsDrawn={(polygons) => console.log('Available polygons', polygons)}
  scriptLibraries="geometry"
  existingArea={JSON.parse(localStorage.getItem('geojson'))}
  onSave={(data) => localStorage.setItem('geojson', JSON.stringify(data))}
  mapStyles={mapStyles}
  areaStyles={areaStyles}
  zoom={12}
  center={{ lat: 51.9246562, lng: 4.4763706 }}
/>

```

Or if there are components that depend on the map, you can utilize render props.

```
<ReactGeoJSON
  apiKey="..."
  onMapInitiated={(map) => console.log('Map initiated', map)}
  existingArea={JSON.parse(localStorage.getItem('geojson'))}
  onSave={(data) => localStorage.setItem('geojson', JSON.stringify(data))}
  mapStyles={mapStyles}
  areaStyles={areaStyles}
  zoom={12}
  center={{ lat: 51.9246562, lng: 4.4763706 }}
>
  {({ map }) => <Component map={map} />}
</ReactGeoJSON>
```

### Props

- `apiKey`\* - Your Google Maps api key.\
- `onMapInitiated` - Callback for when the map has been initiated.\
- `onPolygonsDrawn` - Callback for when polygons have been drawn (or updated).\
- `ExistingArea` - An existing GeoJSON object to initially show.\
- `onSave` - Callback function on save click. Gets the GeoJSON data as argument.\
- `mapStyles` - Map styles, as defined on [mapstyle](https://mapstyle.withgoogle.com/).\
- `areaStyles` - Polygon styles, documented on [Google Developers - Shapes#polygons](https://developers.google.com/maps/documentation/javascript/shapes#polygons)\
- `zoom` - Initial zoom level of the map.\
- `center` - Initial center point of the map.\
- `editable` - Default true - disable or enable editing polygons shown on map.\
- `mapOptions` - Possibility to add more map options to the Google Map.\
- `scriptLibraries` - Possibility to add script libraries to the Google Maps url string (ie [Drawing tools](https://developers.google.com/maps/documentation/javascript/examples/drawing-tools) or [Geometries](https://developers.google.com/maps/documentation/javascript/examples/geometry-headings)).\

\_\* is required

### Map options

By passing `mapOptions` as a prop, you're able to change props that are being passed to the Google Maps api. The following props are always set and cannot be overwritten:

- center - To set the center of the map.
- zoom - To set the zoom level of the map.
- disableDefaultUI - Set to true to disable the UI provided by Google Maps.
- clickableIcons: - Set to false to disable clickable icons that are shown in the map.
- styles - Map styles that are set by props.

### Licence

[MIT](https://oss.ninja/mit/mjanssen/)
