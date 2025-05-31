//有关tif地图文件上传的操作（elUpload）

import { ElMessage } from "element-plus";
import{uploadLayer} from'@/api/getLayer.js'

// export const beforeUpload = (file) => {
//     const isTif = file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff');
//     if (!isTif) {
//       ElMessage.error('Only TIF/TIFF files are allowed!');
//       return false;
//     }
//     else{
//       ElMessage.error('文件不符合格式');

//   return false;  // 阻止文件立即上传
//     }
//   };
// 开启文件详情窗口
// export async function openDrawer(row) {
//     name.value = row.datasetName;
//     curDatasetUrl.value = row.datasetUrl;
//     drawer.value = true;
//   }
  

  
  // 文件创建
  export function createMap(form,uploadUrl,upload) {
    form.value.validate(valid => {
      if (valid) {
        uploadUrl.value =
          `${import.meta.env.VITE_APP_BASE_URL}/geoserver/upload`;
        nextTick(async () => {
          // tableLoading.value = false;
          await upload.value.submit();
          // getList();
        });
      }
    });
  }
  
  // 文件上传成功回调
  export async function handleSuccess(response,upload,form) {
    const datasetUrl = response.url;
    upload.value.clearFiles();
    const res=await uploadLayer({ ...form, datasetUrl });
    
    ElMessage.success('File uploaded successfully.');
    if(res.code==200){
      console.log("操作成功");
      ElMessage.success("操作成功")
    }
    else if(res.code==400){
      ElMessage.error(res.msg);
    }
    // dialogFormVisible.value = false;
    // getList();
  }
  
  // 文件上传失败回调
  export function uploadFileError() {
    // $modal.msgError('');
    ElMessage.error('Upload failed.')
  }
  // 文件替换
  export function handleExceed(files) {
    upload.value?.clearFiles();
    const file = files[0];
    upload.value?.handleStart(file);
  }
  
  // 文件修改
  async function updateData() {
    form.value.validate(valid => {
      if (valid) {
        tableLoading.value = true;
        updateFile({ ...datasetsForm, dateTime: parseTime(datasetsForm.dateTime) }).then(res => {
          tableLoading.value = false;
          dialogFormVisible.value = false;
          getList();
        }).catch(err => {
          loading.value = false;
          $modal.msgError('修改失败');
        });
      }
    });
  }