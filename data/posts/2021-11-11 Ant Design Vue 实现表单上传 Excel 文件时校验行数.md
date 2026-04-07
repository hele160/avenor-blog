---
title: 'Ant Design Vue 实现表单上传 Excel 文件时校验行数'
time: '2024-07-10'
tags: ["linux"]
summary: '最近在开发时遇到这样的需求：对上传的 Excel 文件行数进行校验，行数超过 1000 则提示用户数据超限。本来该校验是在用户选择文件后由前端校验，后续临时变更为上传文件后由后端校验，但是前端代码已经开发完毕了，直接删除怪可惜的，遂记录'
---

最近在开发时遇到这样的需求：对上传的 Excel 文件行数进行校验，行数超过 1000 则提示用户数据超限。本来该校验是在用户选择文件后由前端校验，后续临时变更为上传文件后由后端校验，但是前端代码已经开发完毕了，直接删除怪可惜的，遂记录。

## 完整代码实现

想要在线尝试可以点击这里👉 [在线代码](https://codesandbox.io/p/sandbox/ant-design-vue-shi-xian-biao-dan-shang-chuan-excel-wen-jian-shi-xiao-yan-xing-shu-j875d7?file=%2Fsrc%2FApp.vue%3A57%2C15&layout=%257B%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522rootPanelGroup%2522%253A%257B%2522direction%2522%253A%2522horizontal%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522id%2522%253A%2522ROOT_LAYOUT%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522clyfs2m3000063b6jqecvx7iy%2522%252C%2522sizes%2522%253A%255B100%252C0%255D%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522EDITOR%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522id%2522%253A%2522clyfs2m3000023b6jcbyh4f01%2522%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522SHELLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522id%2522%253A%2522clyfs2m3000033b6j4vhexoll%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522DEVTOOLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522id%2522%253A%2522clyfs2m3000053b6jfhcroirh%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%252C%2522sizes%2522%253A%255B50%252C50%255D%257D%252C%2522tabbedPanels%2522%253A%257B%2522clyfs2m3000023b6jcbyh4f01%2522%253A%257B%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clyfs2m2z00013b6jhvq9zg1q%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522filepath%2522%253A%2522%252Fsrc%252FApp.vue%2522%252C%2522state%2522%253A%2522IDLE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A57%252C%2522startColumn%2522%253A15%252C%2522endLineNumber%2522%253A57%252C%2522endColumn%2522%253A15%257D%255D%257D%255D%252C%2522id%2522%253A%2522clyfs2m3000023b6jcbyh4f01%2522%252C%2522activeTabId%2522%253A%2522clyfs2m2z00013b6jhvq9zg1q%2522%257D%252C%2522clyfs2m3000053b6jfhcroirh%2522%253A%257B%2522id%2522%253A%2522clyfs2m3000053b6jfhcroirh%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clyfs2m3000043b6jjmxnmbbc%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522UNASSIGNED_PORT%2522%252C%2522port%2522%253A0%252C%2522path%2522%253A%2522%252F%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clyfs2m3000043b6jjmxnmbbc%2522%257D%252C%2522clyfs2m3000033b6j4vhexoll%2522%253A%257B%2522tabs%2522%253A%255B%255D%252C%2522id%2522%253A%2522clyfs2m3000033b6j4vhexoll%2522%257D%257D%252C%2522showDevtools%2522%253Atrue%252C%2522showShells%2522%253Afalse%252C%2522showSidebar%2522%253Atrue%252C%2522sidebarPanelSize%2522%253A15%257D)

```javascript
<template>
  <div id="app">
    <a-form :form="batchImportForm">
      <!-- 文件上传 -->
      <a-form-item label="文件上传">
        <a-upload
          v-decorator="['uploadFile', fileOption]"
          accept=".xlsx,.xls"
          :file-list="fileList"
          :remove="handleRemove"
          :before-upload="handleBeforeUpload"
        >
          <a-button shape="round">文件上传</a-button>
        </a-upload>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  name: "App",
  data() {
    return {
      // 批量导入表单
      batchImportForm: this.$form.createForm(this),
      // 文件列表
      fileList: [],
    };
  },
  computed: {
    // 文件上传表单校验
    fileOption() {
      return {
        rules: [
          {
            message: "文件条数超限，最多10条",
            validator: this.isFileEntryExceed,
          },
        ],
      };
    },
  },
  methods: {
    handleRemove() {
      this.fileList = [];
    },
    handleBeforeUpload(file) {
      this.fileList = [file];
      return false;
    },
    // 判断文件条数是否超限 10 条，表头不计
    isFileEntryExceed(rule, value, callback) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const rowCount = jsonData.length;
        if (rowCount > 10) {
          callback(new Error(rule.message));
        }
        callback();
      };
      reader.readAsArrayBuffer(value.file);
    },
  },
};
</script>
```

## 行数校验

以 Excel 文件的第一个 Sheet 页为例，使用 `xlsx` 库将文件转换为 JSON 数据，然后获取数据的长度即可。

```javascript
// 判断文件条数是否超限 10 条，表头不计
function isFileEntryExceed(rule, value, callback) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);

    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const rowCount = jsonData.length;
    // 需要注意的是表头不计入行数
    if (rowCount > 10) {
      callback(new Error(rule.message));
    }
    callback();
  };

  reader.readAsArrayBuffer(value.file);
}
```

