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
