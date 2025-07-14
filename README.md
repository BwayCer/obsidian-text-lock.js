文字鎖
=======

加密 Obsidian 內容塊。


## 功能

<div>
  <img src="./looseLeaf/assets/desktop-02.webp" width="48%" />
  <img src="./looseLeaf/assets/desktop-03.webp" width="48%" />
  <img src="./looseLeaf/assets/desktop-01.webp" width="30%" />
  <img src="./looseLeaf/assets/desktop-04.webp" width="30%" />
  <img src="./looseLeaf/assets/desktop-05.webp" width="30%" />
</div>
<div>
  <img src="./looseLeaf/assets/mobile-04.webp" height="250px" />
  <img src="./looseLeaf/assets/mobile-05.webp" height="250px" />
</div>


## 開發

**`./src/data.ts` :**

  ```ts
  export const isTest = true;
  ```

**打包 :**

  ```bash
  deno task build
  ```


### 如何增加加密算法

請依據 [需要實現的類型](src/cryptoCan/cryptoCan.d.ts)
或參考現有的 [AES-GCM-256](src/cryptoCan/aes-gcm-256-v1.ts)
文件。
