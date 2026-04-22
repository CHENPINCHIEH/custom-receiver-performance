const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

//Media Sample API Values
const SAMPLE_URL =
  "https://storage.googleapis.com/cpe-sample-media/content.json";
const StreamType = {
  DASH: "application/dash+xml",
  HLS: "application/x-mpegurl",
};
const TEST_STREAM_TYPE = StreamType.DASH;

// Debug Logger
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = "My.LOG";
const LOG_TAG_PERFORMANCE = "Performance.LOG";


// Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
castDebugLogger.setEnabled(true);

// Show debug overlay
// castDebugLogger.showDebugLogs(true);

castDebugLogger.loggerLevelByEvents = {
  // 先預設debug等級，之後可以根據事件類型調整
  
  // 當發生核心事件（如播放、暫停、錯誤）
  'cast.framework.events.category.CORE': cast.framework.LoggerLevel.DEBUG,
  
  // 當媒體狀態改變（如換歌、播完）
  'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
};

castDebugLogger.loggerLevelByTags = {
  LOG_TAG: cast.framework.LoggerLevel.DEBUG,
};

async function makeRequest(method, url) {
  try {
    const response = await fetch(url, { method });

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
      };
    }
    return await response.json();
  } catch (error) {
    // 這裡會捕捉到網路錯誤或是上面 throw 的錯誤
    throw error; 
  }
}

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  async (request) => {
    castDebugLogger.info(LOG_TAG, "Intercepting LOAD request");

    // Map contentId to entity (簡化賦值)
    // for smart display, we use entity to identify the content, so we need to map it to contentId for later use
    if (request.media?.entity) {
      request.media.contentId = request.media.entity;
    }

    try {
      // 2. 使用 await 呼叫我們先前改寫好的 makeRequest (fetch 版本)
      const data = await makeRequest("GET", SAMPLE_URL);
      const item = data[request.media.contentId];

      if (!item) {
        castDebugLogger.error(LOG_TAG, "Content not found");
        // 在 interceptor 中拋出錯誤或回傳 null 即可停止載入
        return null; 
      }

      // 3. 設定串流類型與 URL
      request.media.contentType = TEST_STREAM_TYPE;

      if (TEST_STREAM_TYPE === StreamType.DASH) {
        request.media.contentUrl = item.stream.dash;
      } else if (TEST_STREAM_TYPE === StreamType.HLS) {
        request.media.contentUrl = item.stream.hls;
        request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.FMP4;
        request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.FMP4;
      }

      castDebugLogger.warn(LOG_TAG, "Playable URL:", request.media.contentUrl);

      // 4. 設定 Metadata (使用物件簡寫)
      request.media.metadata = new cast.framework.messages.GenericMediaMetadata();
      request.media.metadata.title = item.title;
      request.media.metadata.subtitle = item.author;

      // 5. 直接回傳修改後的 request，async 函數會自動包裝成 Resolved Promise
      return request;

    } catch (error) {
      castDebugLogger.error(LOG_TAG, "Request failed", error);
      return null; // 發生錯誤時攔截並停止載入
    }
  }
);
// Optimizing for smart displays
const touchControls = cast.framework.ui.Controls.getInstance();
const playerData = new cast.framework.ui.PlayerData();
const playerDataBinder = new cast.framework.ui.PlayerDataBinder(playerData);

let browseItems = await getBrowseItems();

async function getBrowseItems() {
  try {
    // 1. 等待資料抓取完成
    const data = await makeRequest("GET", SAMPLE_URL);
    
    // 2. 使用 .map() 代替 for...in，語法更簡潔且具備函數式編程風格
    // Object.entries(data) 會同時給你 [key, value]
    const browseItems = Object.entries(data).map(([key, value]) => {
      const item = new cast.framework.ui.BrowseItem();
      item.entity = key;
      item.title = value.title;
      item.subtitle = value.description;
      item.image = new cast.framework.messages.Image(value.poster);
      item.imageType = cast.framework.ui.BrowseImageType.MOVIE;
      return item;
    });

    return browseItems;
  } catch (error) {
    console.error("Failed to fetch browse items:", error);
    return []; // 發生錯誤時回傳空陣列，防止程式崩潰
  }
}

let browseContent = new cast.framework.ui.BrowseContent();
browseContent.title = "Up Next";
browseContent.items = browseItems;
browseContent.targetAspectRatio =
  cast.framework.ui.BrowseImageAspectRatio.LANDSCAPE_16_TO_9;

playerDataBinder.addEventListener(
  cast.framework.ui.PlayerDataEventType.MEDIA_CHANGED,
  (e) => {
    if (!e.value) return;

    // Media browse
    touchControls.setBrowseContent(browseContent);

    // Clear default buttons and re-assign
    touchControls.clearDefaultSlotAssignments();
    touchControls.assignButton(
      cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
      cast.framework.ui.ControlsButton.SEEK_BACKWARD_30
    );
  }
);

context.start();
