# PRISMA
|**遊戲流程**|**Score**|**Check**|
|:-:|:-:|:-:|
|開頭動畫(Optional)|-|N|
|主畫面|-|Y|
|功能選單|-|Y|
|關卡選擇(Optional)|-|N|
|進入遊戲|-|Y|
|暫停/繼續遊戲|-|N|
|遊戲獲勝/失敗畫面|-|N|
|回到主畫面|-|N|

|**遊戲技術**|**Score**|**Check**|
|:-:|:-:|:-:|
|帳號登入/註冊/登出|3%|Y|
|排行榜|4%|N|
|存檔機制|6%|Y|
|物理系統|13%|Y|
|各場景BGM|2%|Y|
|不同音效|5%|0/5|
|所有角色移動|4%|Y|
|移動以外的操作|3%|3/3|
|所有角色動作動畫|4%|N|
|轉場動畫|2%|Y|
|開場動畫|2%|N|
|結束動畫|2%|N|
|Action動畫|2%|N|
|五種不同粒子特效|5%|1/5|
|使用Git|7%|Y|

|**進階功能**|**Score**|**Check**|
|:-:|:-:|:-:|
|AI Path Finding|0-6%|N|
|Node Pooling|0-4%|N|
|客製化渲染效果|0-4%|N|
|2.5D|0-2%|n|
|打擊感|0-3%|N|
|特殊遊戲運鏡|0-4%|N|
|客製化物理系統|0-4%|N|
|關卡編輯器|0-8%|0/3|
|自動地圖生成|0-4%|N|
|無限地圖|0-3%|N|
|魔王機制|0-2%|N|
|線上多人遊戲|0-8%|N|

# 註解
### 遊戲流程
- 遊戲獲勝/失敗畫面: 失敗-> 玩家死亡重生，獲勝-> 獲得晶瑩石，進入下一關
- 功能選單: 設定(包含熱鍵、音量)

### 遊戲技術
- 存檔機制: 儲存玩家的熱鍵及音量設定，此外，玩家點擊開始後會出現在上個存檔點
- 不同音效
    1. 點擊按鈕音效
- 移動以外的操作
    1. 拖曳箱子
    2. 拾取晶瑩石
    3. 將晶瑩石嵌入燈座
- Action動畫: 玩家拾取晶瑩石、將晶瑩石嵌入燈座
- 五種不同粒子特效
    1. 雷射

### 進階功能
- Level Editor: 試著硬凹
- Node Pooling: 石頭產生器
- 特殊遊戲運鏡: Track Camera
- 客製化物理系統: 判定多個sensor，換色後物體消失、顯現
- 自訂:
    - 換色機制: 按住滑鼠左鍵即可開啟選色環，將滑鼠向顏色拖動即可將光圈設為該顏色
    - 燈座: 玩家需將晶瑩石嵌入燈座，燈座會發光，會產生一個固定的光圈
    - 顏色: 在光圈範圍內，和光圈顏色相同的物體會消失
    - Notification Toast: 登入、登出、註冊成功時會有提示訊息
    - Hotkey Setting: 可以設定熱鍵，並且在遊戲中使用

