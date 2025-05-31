<template>
  <div class="home-container">
    <div class="home-header">
      <div class="header-title">ROBOTMAP</div>
      <div class="header-nav">
        <div class="upload" @click="dialogCreateMaps = true">Create Map</div>
        <div class="maps" @click="((dialogShowMaps = true), getnameWork())">Your Maps</div>
        <el-dropdown trigger="click">
          <div class="create">Create Route</div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="startDrawing">开始绘制</el-dropdown-item>
              <el-dropdown-item @click="undoLastPoint" :disabled="drawnCoordinates.length === 0"
                >撤销上一步</el-dropdown-item
              >
              <el-dropdown-item @click="clearRoute" :disabled="drawnCoordinates.length === 0"
                >清除路线</el-dropdown-item
              >
              <el-dropdown-item @click="showRouteDialog">加载保存路线</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="home-main">
      <div id="cesiumContainer" ref="cesiumContainer"></div>
    </div>

    <!-- 上传地图信息-->
    <el-dialog v-model="dialogCreateMaps" title="Create layer" width="600">
      <el-form :model="form" :rules="rules" ref="formRef" v-loading="loading" @submit.prevent>
        <el-form-item label="layer name" label-width="140" prop="layerName">
          <el-input v-model="form.layerName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Upload File" label-width="140"
          ><el-upload
            ref="upload"
            v-model:file-list="fileList"
            class="upload-demo"
            :action="uploadUrl"
            :auto-upload="false"
            :on-exceed="handleExceed"
            :on-error="uploadFileError"
            multiple
            accept=".tif,.tiff"
          >
            <el-button type="primary">Click to upload</el-button>
            <template #tip>
              <div class="el-upload__tip">Only TIF files are allowed, no size limit.</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSuccess()">确认提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 展示地图图层信息-->
    <el-dialog v-model="dialogShowMaps" title="Show layers" width="600">
      <el-table
        :data="tableMaps"
        style="width: 100%; height: 90vh"
        @current-change="handleSelecedLayer"
        highlight-current-row
      >
        <el-table-column prop="date" label="Date" />
      </el-table>
      <el-button color="#082631" style="margin-top: 20px" @click="loadLayers">确认</el-button>
      <el-pagination size="small" layout="prev, pager, next" :total="5" />
    </el-dialog>

    <!-- 展示保存路线对话框 -->
    <el-dialog v-model="dialogShowRoutes" title="Select Saved Route" width="600">
      <el-table
        :data="savedRoutes"
        style="width: 100%; height: 60vh"
        @current-change="handleSelectedRoute"
        highlight-current-row
      >
        <el-table-column prop="name" label="Route Name" />
        <el-table-column prop="createdAt" label="Created Time" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
      <div class="dialog-footer">
        <el-button
          color="#082631"
          style="margin-top: 20px"
          @click="loadSelectedRoute"
          :disabled="!selectedRouteId"
        >
          确认
        </el-button>
        <el-button
          type="danger"
          style="margin-top: 20px; margin-left: 10px"
          @click="deleteSelectedRoute"
          :disabled="!selectedRouteId"
        >
          删除
        </el-button>
      </div>
      <el-pagination
        small
        layout="prev, pager, next"
        :total="totalRoutes"
        @current-change="handlePageChange"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import * as Cesium from 'cesium'

import { ElMessage, ElMessageBox } from 'element-plus'
// import axios from 'axios'
import { fetchPosition } from '@/api/fetchPosition.js'
// import {service}  from '@/utils/request.js'
import { getLayerName, getWorkName, uploadLayer } from '@/api/getLayer.js'
import { onMounted, ref, reactive, watch, toRefs, nextTick, onUnmounted } from 'vue'
import { handleExceed, uploadFileError } from '@/utils/fileUpload/fileUpload.js'
// import.meta.env.VITE_API_BASE_URL  // 确保在 `home.vue` 里直接使用
import { getBaseURL } from '@/utils/request.js'
// import { request } from 'pulp'
import request from '@/utils/request.js'

const baseUrl = getBaseURL()
//显示地图创建对话框
const dialogCreateMaps = ref(false)
const dialogShowMaps = ref(false)
const viewer = ref(null)
//所填写的表格
const form = reactive({
  layerName: '',
  storename: '',
  workspace: '',
})
const tableMaps = ref([])
const { layerName, storename, workspace } = toRefs(form)
const showLayers = ref([])
const fileList = ref([])

//绘制路线
const drawing = ref(false)
const drawnCoordinates = ref([])
let handler = null // 事件处理器
let entity = null // 存储绘制的路线
const modelEntity = ref(null)
// 机器狗的初始坐标
//latitude: 30.52975654413782, longitude: 114.34945259087526
const initLng = ref(114.35276493) // 默认经度
const initLat = ref(30.47844799) // 默认纬度
// const initLng = ref(null)
// const initLat = ref(null)
const initAlt = 0
// const startCartesian = ref(null)
const startCartesian = Cesium.Cartesian3.fromDegrees(initLng.value, initLat.value, initAlt)

// if (initLng.value == null && initLat.value == null) {
//   startCartesian = Cesium.Cartesian3.fromDegrees(114.35245723, 30.47807759, 0)
// }

const currentPos = ref(null)
let timer = null

// 定义 fetchPosition：请求后台最新坐标，更新 currentPos
// const fetchPosition = async () => {
//   try {
//     console.log('发起定位请求')
//     const { data } = await axios.get('http://47.122.123.251:2345/api/go2/position/current')
//     console.log('响应数据', data)

//     if (data.status === 'success') {
//       const { latitude, longitude } = data.position
//       const lat = parseFloat(latitude)
//       const lng = parseFloat(longitude)

//       if (!isNaN(lat) && !isNaN(lng)) {
//         const position = Cesium.Cartesian3.fromDegrees(lng, lat, initAlt)
//         currentPos.value = position
//         drawnCoordinates.value.push(position)
//         console.log('更新坐标成功', position)
//       } else {
//         console.warn('经纬度无效:', lat, lng)
//       }
//     } else {
//       console.warn('接口返回状态不是 success:', data)
//     }
//   } catch (e) {
//     console.error('请求异常:', e)
//   }
// }
const getPosition = async () => {
  console.log('进入 fetchPosition')
  const url = 'http://47.122.123.251:2345/go2/position/current'
  let lat, lng
  try {
    const res = await fetchPosition(url)
    console.log('接口返回：', res)

    if (res.status === 'success') {
      console.log('接口返回成功')
      const { latitude, longitude } = res.position
      lat = parseFloat(latitude)
      lng = parseFloat(longitude)
    }
    // const data = response.data.data
    // console.log('响应数据', data)

    // if (data.status === 'success') {
    //   const { latitude, longitude } = data.position
    //   const lat = parseFloat(latitude)
    //   const lng = parseFloat(longitude)

    // if (!isNaN(lat) && !isNaN(lng)) {
    //   const position = Cesium.Cartesian3.fromDegrees(lng, lat, initAlt)
    //   currentPos.value = position
    //   drawnCoordinates.value.push(position)
    //   console.log('更新坐标成功', position)
    // } else {
    //   console.warn('经纬度无效:', lat, lng)
    // }
    // } else {
    //   console.warn('接口返回非 success:', data)
    // }
  } catch (e) {
    console.error('请求异常:', e)
  }
  if (!isNaN(lat) && !isNaN(lng)) {
    const position = Cesium.Cartesian3.fromDegrees(lng, lat, initAlt)
    currentPos.value = position
    drawnCoordinates.value.push(position)
    console.log('更新坐标成功', position)
  } else {
    console.warn('经纬度无效:', lat, lng)
    // const position = Cesium.Cartesian3.fromDegrees(114.35245723, 30.47807759, initAlt)
    // currentPos.value = position
    // drawnCoordinates.value.push(position)
    ElMessage.error('经纬度无效:', lat, lng)
  }
}

//保存加载路径
const dialogShowRoutes = ref(false)
const selectedRouteId = ref(null)
const savedRoutes = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalRoutes = ref(0)
const routeLoading = ref(false)

// 时间格式化方法
const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

//获取狗的坐标

// 显示对话框方法
const showRouteDialog = async () => {
  dialogShowRoutes.value = true
  await loadSavedRoutes()
}

onMounted(() => {
  nextTick(() => {
    console.log(import.meta.env.VITE_APP_BASE_URL, '基地址')
  })
  getnameWork()
  console.log(getBaseURL())
  // 初始化 Cesium 视图器
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZDY2YzAxMS02Nzc4LTQyZGMtYjU5MC0xNDIyNDc2MzZlODYiLCJpZCI6MjkxMjcxLCJpYXQiOjE3NDM5MjYxNDl9.U0mgwiqQE22npBjqbrCYhAkVJIRzmw9eXgFndNNnJSQ'
  viewer.value = new Cesium.Viewer('cesiumContainer', {
    // 调整基础设置隐藏组件
    animation: false, // 动画小部件
    baseLayerPicker: false, // 地图图层组件
    fullscreenButton: false, // 全屏组件
    geocoder: false, // 地理编码搜索组件
    homeButton: false, // 首页组件
    infoBox: false, // 信息框
    sceneModePicker: false, // 场景模式
    selectionIndicator: false, // 选取指示器组件
    timeline: false, // 时间轴
    navigationHelpButton: false, // 帮助按钮
    navigationInstructionsInitiallyVisible: false,
    shouldAnimate: true,
  })

  getPosition().then(() => {
    initModelAndMonitoring()
  })
  if (!timer) {
    timer = setInterval(getPosition, 10000)
  }
  if (initLng.value != null && initLat.value != null) {
    const cartesian = Cesium.Cartesian3.fromDegrees(initLng.value, initLat.value, initAlt)
    startCartesian.value = cartesian
    currentPos.value = cartesian
  }
})

const selectedLayer = ref('')
const handleSelecedLayer = (rowDate) => {
  if (rowDate && rowDate.date) {
    selectedLayer.value = rowDate.date
    console.log('被选中行的数据', selectedLayer.value)
  } else {
    console.error('选中的行数据无效或缺少 date 属性')
  }
}
const truemap = 'truemap:truemap' // 替换成实际的图层名

// 加载图层并跳转到指定坐标
const loadLayers = () => {
  dialogShowMaps.value = false

  if (!viewer.value) {
    ElMessage.error('Cesium 视图器未初始化')
    return
  }
  const layerName = truemap // const layerUrl = `http://202.140.140.215:9999/geoserver/${selectedLayer.value}/wms?`;
  //const layerName = `${selectedLayer.value}:${selectedLayer.value}` // const layerUrl = `http://202.140.140.215:9999/geoserver/${selectedLayer.value}/wms?`;
  // const layerUrl = `http://47.122.123.251:8233/geoserver/${selectedLayer.value}/wms?` // const bbox = "114.348977902349,30.528903163361175,114.35036065924551,30.530418382267538";
  const layerUrl = `http://47.122.123.251:8233/geoserver/truemap/wms?` // const bbox = "114.348977902349,30.528903163361175,114.35036065924551,30.530418382267538";
  // **检查是否已存在相同的图层，避免重复加载**
  const layers = viewer.value.imageryLayers
  for (let i = 0; i < layers.length; i++) {
    const existingProvider = layers.get(i).imageryProvider
    if (existingProvider.url === layerUrl && existingProvider.layers === layerName) {
      console.log('图层已存在，无需重复加载')
      return
    }
  } // **创建 imageryProvider**

  const imageryProvider = new Cesium.WebMapServiceImageryProvider({
    url: layerUrl,
    // layers: layerName,
    layers: truemap,
    parameters: {
      service: 'WMS',
      format: 'image/png',
      srs: 'EPSG:4326', // 确保 GeoServer 兼容
      transparent: true,
      styles: '',
      version: '1.1.1', // 确保 WMS 兼容性
      // bbox:bbox,
    },
    tileWidth: 256, // 优化瓦片加载
    tileHeight: 256,
  }) // **添加图层**

  layers.addImageryProvider(imageryProvider)
  console.log('新图层加载成功') // **仅在首次加载时调整视角**

  if (!viewer.value.camera.flyToExecuted) {
    // viewer.value.camera.flyTo({
    //   // destination: Cesium.Cartesian3.fromDegrees(110.35036065924551, 22.53041838226753, 50000.0),
    //   destination: Cesium.Cartesian3.fromDegrees(114.35036065924551, 30.53041838226753, 50000.0),
    // });//114 30
    viewer.value.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(
        114.35174565816527,
        30.47722442663829,
        114.35321111393918,
        30.4788066443522,
      ),
    })

    viewer.value.camera.flyToExecuted = true // 标记已执行
  }
}
// // 跳转到指定坐标
// viewer.value.camera.flyTo({
//   destination: Cesium.Cartesian3.fromDegrees(114.3550, 30.4796, 800.0),
// })

// var imageryProvider = new Cesium.WebMapServiceImageryProvider({
//     // 这里是你的 geoserver服务点击查看图层的 url
//     url: 'http://localhost:8089/geoserver/cesiumMapTest/wms',
//     // 这里是自定义的图层名称
//     layers: 'geotiff_coverage',
//     parameters: {
//         service: 'WMS',
//         format: 'image/png',
//         transparent: true
//     }
// });
// // 图层添加
// viewer.imageryLayers.addImageryProvider(imageryProvider);

// // 跳转到指定坐标
// viewer.camera.flyTo({
//     destination: Cesium.Cartesian3.fromDegrees(112.070, 31.353, 500.0)
// });
// const get =async(form)=>{
//   const res =await uploadLayer(form);

//     if(res.code==200){
//       console.log("操作成功");
//       ElMessage.success("操作成功")
//     }
//     else {
//       ElMessage.error(res.msg);
//     }

// };
const loading = ref(false)
const getnameWork = async () => {
  const res = await getWorkName()
  // tableMaps.value=res.data
  if (res.code == 200) {
    console.log('tableMaps', tableMaps.value)
    ElMessage.success('操作成功')
    tableMaps.value = res.data.map((item) => {
      return {
        date: item,
      }
    })
  } else if (res.code == 400) {
    ElMessage.error(res.msg)
  }
}

watch(currentPos, (newVal) => {
  console.log('currentPos 改变:', newVal)
})

// const initModelAndMonitoring = () => {
//   if (!viewer.value) return

//   // 设置起点坐标
//   const position = Cesium.Cartesian3.fromDegrees(initLng, initLat, initAlt)

//   // 使用 PointPrimitive 显示圆点
//   const point = viewer.value.scene.primitives.add(new Cesium.PointPrimitiveCollection())
//   point.add({
//     position: position, // 圆点的位置
//     color: Cesium.Color.BLUE, // 圆点颜色
//     pixelSize: 10, // 圆点大小
//   })

//   // 添加坐标监测监听器
//   // viewer.value.scene.preUpdate.addEventListener((scene, time) => {
//   //   const currentPosition = Cesium.Matrix4.getTranslation(
//   //     point._primitives[0].modelMatrix,
//   //     new Cesium.Cartesian3(),
//   //   )
//   //   const cartographic = Cesium.Cartographic.fromCartesian(currentPosition)
//   //   currentCoordinates.longitude = Cesium.Math.toDegrees(cartographic.longitude)
//   //   currentCoordinates.latitude = Cesium.Math.toDegrees(cartographic.latitude)
//   //   currentCoordinates.altitude = cartographic.height

//   //   console.log(
//   //     `当前坐标：${currentCoordinates.longitude.toFixed(6)}, ${currentCoordinates.latitude.toFixed(6)}, ${currentCoordinates.altitude.toFixed(2)}`,
//   //   )
//   // })
// }

// **表单验证规则**
const initModelAndMonitoring = () => {
  if (!viewer.value) return

  // —— ① 固定起点实体 ——
  viewer.value.entities.add({
    id: 'start-point',
    // position: startCartesian.value,
    position: startCartesian || Cesium.Cartesian3.fromDegrees(114.35218047, 30.47829655, initAlt),

    point: {
      pixelSize: 12,
      color: Cesium.Color.YELLOW,
    },
  })

  // —— ② 动态移动实体 ——
  viewer.value.entities.add({
    id: 'moving-point',
    position: new Cesium.CallbackProperty(() => {
      // 每次渲染都会读取最新 currentPos
      return currentPos.value
    }, false),
    point: {
      pixelSize: 10,
      color: Cesium.Color.BLUE,
    },
  })
  viewer.value.entities.add({
    id: 'route-line',
    polyline: {
      positions: new Cesium.CallbackProperty(() => drawnCoordinates.value, false),
      width: 3,
      material: Cesium.Color.BLUE,
    },
  })
}

const rules = {
  layerName: [
    { required: true, message: 'Layer Name 不能为空', trigger: 'blur' },

    { pattern: /^[a-zA-Z0-9]+$/, message: 'Layer Name 只能包含英文字符和数字', trigger: 'blur' },
  ],
}
// **重置表单**
const resetForm = () => {
  formRef.value.resetFields()
  console.log('表单重置成功')
}

//文件处理
const formRef = ref(null)

// 上传实例
const upload = ref(null)
// 文件上传
const uploadUrl = ref('')
// const handleSuccess = (response, file, fileList) => {
//   console.log(fileList,"handleSuccess");
//   // fileLIst = fileList; // 确保fileList实时更新
//   // ElMessage.success(`${file.name} 上传成功！`);
//   // formRef.value.validateField('fileList'); // 手动触发 fileList 校验
// };

// let tempFiles=[];

// 文件创建
const createMap = () => {
  formRef.value.validate((valid) => {
    if (fileList.value.length == 0) {
      ElMessage.error('请同时提交地图文件')
    } else {
      if (valid) {
        ElMessage.warning('正在创建')
        console.log(import.meta.env.VITE_APP_BASE_URL)

        uploadUrl.value = `${baseUrl}/geoserver/postFile`
        nextTick(async () => {
          // tableLoading.value = false;
          await upload.value.submit()

          // getList();
        })
      }
    }
  })
}
// const submitForm = () => {
//   console.log(fileList,"提交表单1 ");

//   nextTick(()=>{
//   console.log(fileList,"提交表单2");

//   //   formRef.value.validate((valid) => {
//   //   if (valid &&fileList.value.length!=0) {
//   //     console.log(fileList.value.length);
//   //     ElMessageBox.confirm('确定提交表单？', '提示', {
//   //       confirmButtonText: '确定',
//   //       cancelButtonText: '取消',
//   //       type: 'warning'
//   //     })
//   //       .then(() => {
//   //         homeUploadLayer();

//   //         console.log('提交的表单数据:', fileList);
//   //         ElMessage.success('提交成功！');

//   //       })
//   //       .catch(() => {
//   //         ElMessage.info('取消提交');
//   //       });
//   //   } else if(fileList.value.length==0){
//   //     console.log("sokacio");
//   //   console.log(fileList.value.length,"sokacio");

//   //     // console.log();
//   //     // ElMessage.error('请检查表单输入');
//   //   }
//   // });
//   })

// };

const handleSuccess = async (response) => {
  // const file= response.url;
  const file = '/var/www/uploads/feidian/test.tif'
  upload.value.clearFiles()
  loading.value = true
  try {
    const res = await uploadLayer({ ...form, file })
    loading.value = false
    ElMessage.success('地图创建成功')
    resetForm()
  } catch (e) {
    console.log(e, '上传出错')
  }

  // if(res.code==200){
  //   console.log("操作成功");
  //   ElMessage.success("操作成功")
  // }
  // else if(res.code==400){
  //   ElMessage.error(res.msg);
  // }
  // getList();
}

//开始绘制路线
const startDrawing = () => {
  if (!viewer.value) return

  drawing.value = true
  drawnCoordinates.value = []
  // 如果模型实体存在，则以模型当前位置作为起点，否则使用默认起点 startPoint
  let startPos
  if (modelEntity.value && modelEntity.value.position) {
    // 获取当前时间下模型的Cartesian3位置
    startPos = modelEntity.value.position.getValue(viewer.value.clock.currentTime)
  } else {
    startPos = startCartesian
  }
  // 将起点加入绘制路线中
  drawnCoordinates.value.push(startPos)

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas)

  // 画线
  entity = viewer.value.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(() => drawnCoordinates.value, false),
      width: 2,
      material: Cesium.Color.RED,
    },
  })
  // 点击地图添加点
  handler.setInputAction((event) => {
    const cartesian = viewer.value.scene.pickPosition(event.position)
    if (cartesian) {
      drawnCoordinates.value.push(cartesian)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  // 右键结束绘制
  handler.setInputAction(() => {
    handler.destroy()
    drawing.value = false
    if (drawnCoordinates.value.length >= 2) {
      // 创建样条插值对象
      const spline = new Cesium.CatmullRomSpline({
        // 生成时间数组：均分 [0,1]
        times: drawnCoordinates.value.map(
          (_, index) => index / (drawnCoordinates.value.length - 1),
        ),
        points: drawnCoordinates.value,
      })

      // 计算插值点，设置插值精度（例如 100 个点）
      const interpolatedPoints = []
      const numPoints = 50
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        interpolatedPoints.push(spline.evaluate(t))
      }

      // 用平滑后的插值点替换原来的折线点
      drawnCoordinates.value = interpolatedPoints
    } else {
      ElMessage.warning('至少需要两个控制点才能生成曲线')
    }
    sendRouteToBackend()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}

// 撤销上一步
const undoLastPoint = () => {
  if (drawnCoordinates.value.length > 0) {
    drawnCoordinates.value.pop()
  }
}

// 清除所有路线
const clearRoute = () => {
  drawnCoordinates.value = []
  if (entity) {
    viewer.value.entities.remove(entity)
    entity = null
  }
}

// 发送路线给后端
const sendRouteToBackend = async () => {
  if (drawnCoordinates.value.length === 0) {
    ElMessage.warning('未绘制任何路线！')
    return
  }

  const positions = drawnCoordinates.value.map((cartesian) => {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    return {
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
    }
  })

  console.log('发送的坐标数据:', positions)

  try {
    const response = await fetch('http://47.122.123.251:1235/connect/postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(positions),
    })

    if (response.ok) {
      ElMessage.success('路线已成功发送！')
    } else {
      const errorText = await response.text() // 获取错误内容
      throw new Error(`发送失败: ${response.status} - ${errorText}`)
    }
  } catch (error) {
    ElMessage.error(`错误: ${error.message}`)
  }
}

watch(layerName, () => {
  workspace.value = layerName.value
  storename.value = layerName.value
  console.log(storename.value)
  // handleSuccess();
})
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
//删除cesium的版权信息
:deep(.cesium-widget-credits) {
  display: none !important;
}

#cesiumContainer {
  height: 90vh;
}
.home-header {
  background-color: #082631;
  // width: 100vh;\
  height: 10vh;
  display: flex;
  justify-content: space-between;

  // overflow-y: hidden !important;
  .header-title {
    // flex: 1;
    font-size: 3rem;
    font-style: italic;
    color: #fff;
    margin-left: 2vw;
    text-shadow: 3px 3px 8px rgba(255, 255, 255);
  }
  .header-nav {
    font-size: 1.8rem;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    // font-size: 2rem;
    text-align: center;
    color: #fff;
    display: flex;
    .maps,
    .create,
    .upload {
      width: 200px;
      // height: 10px;
      height: 100%;
      display: grid;
      place-items: center;
      margin-left: 10px;
      cursor: pointer;
      &:hover {
        // background-color: pink;
        color: #9bc5ef;
      }
    }
    .create {
      font-size: 1.8rem;
      color: #fff;
    }
  }
}
.home-main {
  background-color: pink;
  height: 2000px;
}
</style>
