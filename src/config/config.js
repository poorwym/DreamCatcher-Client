import { Rectangle } from "cesium";

//Cesium的access token
export const DEFAULT_ION_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMjIzNzQ1NS1lMDIzLTRmOTItYTM4Yy0xNmViZWY2OTA3NDgiLCJpZCI6Mjg0ODg1LCJpYXQiOjE3NDIxODIyMTR9.cFegh-ra1ZG57fFgR5-Dc-iIIEGAXtYyYnwCZEORe8c";

// 默认视角为祖国上空
export const DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(
  70.0,
  -20.0,
  140.0,
  90.0
);