import request from '@/utils/request.js'
//上传文件添加新图层
export function uploadLayer (data){
    return request({
        url:'/geoserver/upload',
        method:'get',
        params:data
    })
}
//获得图层名字
export function getLayerName(workspace){
    return request({
        url:'/geoserver/getLayername',
        method:'get',
        workspace
    })
}
//获得工作区名字
export function getWorkName(){
    return request({
        url:'/geoserver/getWorkplace',
        method:'get',
    })
}