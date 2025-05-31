![9ab80ae8c1263c3825a80a0ef7041f73](https://github.com/user-attachments/assets/c4690bf2-8d7b-4604-87eb-583ccfa72b28)

![b9184c965f17c69331dc053c31656681](https://github.com/user-attachments/assets/43b5369c-94d2-4eec-8b17-3c9444e499be)

![5d09a77a42d63e0d707570a6e31af281](https://github.com/user-attachments/assets/b1e694f2-d1eb-48bb-8e9b-629404c26c3b)

![895fd4a379198d4658c45a490b1033a7](https://github.com/user-attachments/assets/0cda5826-ad53-4be9-a42a-bdd641a3f9e3)

![a77e629848ffc64286ea336fcbbf9280](https://github.com/user-attachments/assets/008124e8-3ea2-4e96-9908-8949141e3d68)

![510cd8b96fd5a32e23beed319aaca4e5](https://github.com/user-attachments/assets/35bfc72e-aee3-43f9-81ad-530830c4185b)

![0c4b3f93f75e2cf5a3a15bffffd0c1ad](https://github.com/user-attachments/assets/2cd2e635-a51c-4ba7-8910-b053a83ca9be)

![6e19f4978cb47b5e758538ceb081d64e](https://github.com/user-attachments/assets/8bb712e9-129b-4e3c-b913-f374ea594447)


本项目是自己参与的一个机器狗导航平台开发项目，主要目的是让机器狗能够按照用户在地图上绘制的航线进行行走，实现导航功能。
在项目中我主要负责前端，该项目主要是由vue3的技术进行开发，并使用了Cesium 库进行地图加载和绘制，因为自己只负责前端部分，因此只能提交前端部分代码

# robotMap

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

const handleRemove = (file, uploadFiles) => {
  console.log(file, uploadFiles) // 打印被删除的文件和剩余文件列表
}
const handlePreview = (uploadFile) => {
  console.log(uploadFile) // 打印被预览的文件信息
}
const beforeRemove = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(`Cancel the transfer of ${uploadFile.name} ?`)
    .then(() => true)
    .catch(() => false) // 取消则返回 false
}
