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
  existingArea={JSON.parse(localStorage.getItem('geojson'))}
  onSave={(data) => localStorage.setItem('geojson', JSON.stringify(data))}
  mapStyles={mapStyles}
  areaStyles={areaStyles}
  zoom={12}
  center={{ lat: 51.9246562, lng: 4.4763706 }}
/>
```

### Props

`apiKey`\* - Your Google Maps api key.\
`ExistingArea` - An existing GeoJSON object to initially show.\
`onSave` - Callback function on save click. Gets the GeoJSON data as argument.\
`mapStyles` - Map styles, as defined on [mapstyle](https://mapstyle.withgoogle.com/).\
`areaStyles` - Polygon styles, documented on [Google Developers - Shapes#polygons](https://developers.google.com/maps/documentation/javascript/shapes#polygons)\
`zoom` - Initial zoom level of the map.\
`center` - Initial center point of the map.

_\* means optional_

### Licence

[MIT](https://oss.ninja/mit/mjanssen/)
