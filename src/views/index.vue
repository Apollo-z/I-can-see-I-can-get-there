<template>
    <div ref="cesiumMapDiv" class="cesium-map">
        <div
                ref="canvas"
                class="map-container"
                id="map-container"
        >

        </div>
        <div class="cesium-toolbar">
            <el-button type="primary" @click="add_ImageLayer_WMS">添加WMS图层</el-button>
            <el-button type="primary" @click="add_ImageLayer_TIF">影像wms加载</el-button>
            <el-button type="primary" @click="add_ImageLayer_WMTS">矢量wmts加载</el-button>
            <el-button type="primary" @click="add_ImageLayer_WMTS_tif">tif-wmts</el-button>
            <el-button type="primary" @click="add_Arcgis">arcgis服务</el-button>
            <el-button type="primary" @click="addTerrainProvider()">加载地形</el-button>
            <el-button type="primary" @click="loadlxPng">加载本地离线</el-button>
            <el-button type="primary" @click="removeLayer">删除图层</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import map from './src/index';

onMounted(() => {
    map.initCesium('map-container');
});
const removeLayer = () => {
    window.viewer.imageryLayers.remove(window.viewer.imageryLayers.get(3))
}

const add_ImageLayer_WMS = () => {

    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(109.055341, 36.005663, 181901), // 设置位置
        orientation: {
            heading: Cesium.Math.toRadians(355.9), // 方向
            pitch: Cesium.Math.toRadians(-86.9), // 倾斜角度
            roll: Cesium.Math.toRadians(360)
        },
        duration: 2, // 设置飞行持续时间，默认会根据距离来计算
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, //线性飞行
        complete: () => {
            var WmsMapService = new Cesium.WebMapServiceImageryProvider({
                url: "http://127.0.0.1:8089/geoserver/youtian/wms", //"http://ip:port/geoserver/cite/wms?layers=cite:sd",//'http://10.0.1.15:8081/geoserver/da1a1f74-528f-4c32-9aa0-e9d0b718f87f/wms?layers=da1a1f74-528f-4c32-9aa0-e9d0b718f87f:test1'//   url 参数  需要带上 工作空间和图层名---layers=topp:test1
                layers: 'youtian:test_wms', //layers,//'test2:1',cite:sd
                parameters: {
                    service: 'WMS',
                    format: 'image/png',
                    srs: 'EPSG:4326',
                    transparent: true, //透明
                },
                minimumLevel: 0,
                maximumLevel: 17,
            })
            window.viewer.imageryLayers.addImageryProvider(WmsMapService)
        }
    })


}

const add_ImageLayer_WMTS = () => {
    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(109.055341, 36.005663, 181901), // 设置位置
        orientation: {
            heading: Cesium.Math.toRadians(355.9), // 方向
            pitch: Cesium.Math.toRadians(-86.9), // 倾斜角度
            roll: Cesium.Math.toRadians(360)
        },
        duration: 2, // 设置飞行持续时间，默认会根据距离来计算
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, //线性飞行
        complete: () => {
            var wmtsLayer = new Cesium.WebMapTileServiceImageryProvider({
                url: 'http://127.0.0.1:8089/geoserver/gwc/service/wmts',
                layer: 'youtian:land_wmts',
                style: '',
                format: 'image/png',
                tilingScheme: new Cesium.GeographicTilingScheme(), //应于EPSG:4326切片方案，是一个简单的地理投影方案
                tileMatrixSetID: 'EPSG:4326',
                tileMatrixLabels: ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2',
                    'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6',
                    'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10',
                    'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14',
                    'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18'],
                maximumLevel: 19,
            });
            window.viewer.imageryLayers.addImageryProvider(wmtsLayer)
        }
    })
}


const add_ImageLayer_WMTS_tif = () => {
    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(99.159168, 25.129715, 8390.69), // 设置位置
        orientation: {
            heading: Cesium.Math.toRadians(355.9), // 方向
            pitch: Cesium.Math.toRadians(-86.9), // 倾斜角度
            roll: Cesium.Math.toRadians(360)
        },
        duration: 2, // 设置飞行持续时间，默认会根据距离来计算
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, //线性飞行
        complete: () => {
            var wmtsLayer = new Cesium.WebMapTileServiceImageryProvider({
                url: 'http://127.0.0.1:8089/geoserver/gwc/service/wmts',
                layer: 'youtian:ProjectRaster1',
                style: '',
                format: 'image/png',
                tilingScheme: new Cesium.GeographicTilingScheme(), //应于EPSG:4326切片方案，是一个简单的地理投影方案
                tileMatrixSetID: 'EPSG:4326',
                tileMatrixLabels: ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2',
                    'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6',
                    'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10',
                    'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14',
                    'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18'],
                maximumLevel: 19,
            });
            window.viewer.imageryLayers.addImageryProvider(wmtsLayer)
        }
    })
}


const add_ImageLayer_TIF = () => {
    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(99.159168, 25.129715, 8390.69), // 设置位置
        orientation: {
            heading: Cesium.Math.toRadians(355.9), // 方向
            pitch: Cesium.Math.toRadians(-86.9), // 倾斜角度
            roll: Cesium.Math.toRadians(360)
        },
        duration: 2, // 设置飞行持续时间，默认会根据距离来计算
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, //线性飞行
        complete: () => {
            var provider = new Cesium.WebMapServiceImageryProvider({        //创建一个图层（geoserver中的tif）
                url: 'http://127.0.0.1:8089/geoserver/youtian/wms',         // geoserver服务地址
                layers: 'youtian:ProjectRaster1',                                // 工作区名：图层名
                parameters: {
                    service: 'WMS',
                    format: 'image/png',
                    srs: 'EPSG:4326',                                 // 坐标系
                    transparent: true,
                }

            });

            window.viewer.imageryLayers.addImageryProvider(provider);
        }
    })


}

const loadlxPng = () => {
    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(99.159168, 25.129715, 8390.69), // 设置位置
        orientation: {
            heading: Cesium.Math.toRadians(355.9), // 方向
            pitch: Cesium.Math.toRadians(-86.9), // 倾斜角度
            roll: Cesium.Math.toRadians(360)
        },
        duration: 2, // 设置飞行持续时间，默认会根据距离来计算
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, //线性飞行
        complete: () => {
            let rectangle = [
                [99.146791604, 25.126356954],//99.146791604,25.126356954,99.157223566,25.134304479
                [99.157223566, 25.134304479],
            ];
            let offlineMap = new Cesium.UrlTemplateImageryProvider({
                url: '/test_dom/{z}/{x}/{y}.png',
                rectangle: Cesium.Rectangle.fromDegrees(
                    rectangle[0][0],
                    rectangle[0][1],
                    rectangle[1][0],
                    rectangle[1][1]
                ),
                minimumLevel: 1,
                maximumLevel: 18,
            });
            window.viewer.imageryLayers.addImageryProvider(offlineMap);
        }
    })


}

const add_Arcgis = () => {
    let arcgis = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
    })
    window.viewer.imageryLayers.addImageryProvider(arcgis);
}


const addTerrainProvider = () => {

    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(99.159168, 25.129715, 8390.69), // 设置位置
        orientation: {
            heading: Cesium.Math.toRadians(355.9), // 方向
            pitch: Cesium.Math.toRadians(-86.9), // 倾斜角度
            roll: Cesium.Math.toRadians(360)
        },
        duration: 2, // 设置飞行持续时间，默认会根据距离来计算
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, //线性飞行
        complete: () => {
            let  terrainProvider = new Cesium.CesiumTerrainProvider({
                    url: "/test_dem/",
                    requestWaterMask: true
                })
            terrainProvider.loaded = true
            window.viewer.scene.terrainProvider = terrainProvider
        }
    })

}

</script>

<style scoped lang="scss">
.cesium-map {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;

  .map-container {
    width: 100%;
    height: 100%;
    position: relative;

    &.half {
      width: 50%;
    }
  }

  .cesium-toolbar {
    position: absolute;
    padding: 5px;
  }
}

</style>
