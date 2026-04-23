const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// Media Sample API Values
const SAMPLE_URL = "https://storage.googleapis.com/cpe-sample-media/content.json";
const StreamType = {
  DASH: "application/dash+xml",
  HLS: "application/x-mpegurl",
};
const TEST_STREAM_TYPE = StreamType.DASH;

// Debug Logger Tags
// const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
// const LOG_TAG = "My.LOG";
// const PERF_METRIC = "Performance.LOG";

// 效能監測全域變數
// let t0_startTime = 0;

// castDebugLogger.setEnabled(true);

// castDebugLogger.loggerLevelByEvents = {
//   'cast.framework.events.category.CORE': cast.framework.LoggerLevel.DEBUG,
//   'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
// };

// castDebugLogger.loggerLevelByTags = {
//   [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
//   [PERF_METRIC]: cast.framework.LoggerLevel.DEBUG,
// };

// async function makeRequest(method, url) {
  // const api_start = performance.now();
  // castDebugLogger.info(PERF_METRIC, "  -> API Request Sent");
  
  // try {
  //   const response = await fetch(url, { method });

    // const api_end = performance.now();
    // const api_duration = (api_end - api_start).toFixed(2);
    // castDebugLogger.info(PERF_METRIC, `  <- API Response Received. Duration: ${api_duration}ms`);

  //   if (!response.ok) {
  //     throw { status: response.status, statusText: response.statusText };
  //   }
  //   return await response.json();
  // } catch (error) {
  //   throw error; 
  // }
// }

// -----------------------------------------------------------------
// 1. LOAD 攔截器 (監測 T0 -> T1)
// -----------------------------------------------------------------
// playerManager.setMessageInterceptor(
//   cast.framework.messages.MessageType.LOAD,
//   async (request) => {
    // [T0] 啟動監測
    // t0_startTime = performance.now();
    // castDebugLogger.warn(PERF_METRIC, "T0: LOAD Request Received");

    // if (request.media?.entity) {
    //   request.media.contentId = request.media.entity;
    // }

    // try {
    //   const data = await makeRequest("GET", SAMPLE_URL);
    //   const item = data[request.media.contentId];

    //   if (!item) {
    //     // castDebugLogger.error(LOG_TAG, "Content not found");
    //     return null; 
    //   }

    //   request.media.contentType = TEST_STREAM_TYPE;
    //   if (TEST_STREAM_TYPE === StreamType.DASH) {
    //     request.media.contentUrl = item.stream.dash;
    //   } else if (TEST_STREAM_TYPE === StreamType.HLS) {
    //     request.media.contentUrl = item.stream.hls;
    //     request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.FMP4;
    //     request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.FMP4;
    //   }

    //   request.media.metadata = new cast.framework.messages.GenericMediaMetadata();
    //   request.media.metadata.title = item.title;
    //   request.media.metadata.subtitle = item.author;

      // [T1] 攔截器邏輯處理完成
      // const t1_time = performance.now();
      // const loadProcessDuration = (t1_time - t0_startTime).toFixed(2);
      // castDebugLogger.warn(PERF_METRIC, `T1: Data Ready. Process Duration: ${loadProcessDuration}ms`);

//       return request;

//     } catch (error) {
//       // castDebugLogger.error(LOG_TAG, "Request failed", error);
//       return null;
//     }
//   }
// );

// -----------------------------------------------------------------
// 2. 監聽播放狀態 (監測 T2: 首幀出圖)
// -----------------------------------------------------------------
// playerManager.addEventListener(
//   cast.framework.events.EventType.PLAYER_STATE_CHANGED,
//   (event) => {
//     if (event.playerState === cast.framework.messages.PlayerState.PLAYING && t0_startTime > 0) {
      // [T2] 影片正式開始播放
      // const t2_time = performance.now();
      // const totalStartupTime = (t2_time - t0_startTime).toFixed(2);
      
      // castDebugLogger.warn(PERF_METRIC, `T2: Video Playing (First Frame). Total Startup Latency: ${totalStartupTime}ms`);
      
      // // 重置起始時間，避免重複計算 (例如暫停後再播放)
      // t0_startTime = 0;
//     }
//   }
// );

// Optimizing for smart displays
// const touchControls = cast.framework.ui.Controls.getInstance();
// const playerData = new cast.framework.ui.PlayerData();
// const playerDataBinder = new cast.framework.ui.PlayerDataBinder(playerData);

// 獲取瀏覽項目並啟動
// getBrowseItems().then(browseItems => {
//   let browseContent = new cast.framework.ui.BrowseContent();
//   browseContent.title = "Up Next";
//   browseContent.items = browseItems;
//   browseContent.targetAspectRatio = cast.framework.ui.BrowseImageAspectRatio.LANDSCAPE_16_TO_9;

//   playerDataBinder.addEventListener(
//     cast.framework.ui.PlayerDataEventType.MEDIA_CHANGED,
//     (e) => {
//       if (!e.value) return;
//       touchControls.setBrowseContent(browseContent);
//       touchControls.clearDefaultSlotAssignments();
//       touchControls.assignButton(
//         cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
//         cast.framework.ui.ControlsButton.SEEK_BACKWARD_30
//       );
//     }
//   );

// });

context.start();

// async function getBrowseItems() {
//   try {
//     const data = await makeRequest("GET", SAMPLE_URL);
//     return Object.entries(data).map(([key, value]) => {
//       const item = new cast.framework.ui.BrowseItem();
//       item.entity = key;
//       item.title = value.title;
//       item.subtitle = value.description;
//       item.image = new cast.framework.messages.Image(value.poster);
//       item.imageType = cast.framework.ui.BrowseImageType.MOVIE;
//       return item;
//     });
//   } catch (error) {
//     console.error("Failed to fetch browse items:", error);
//     return [];
//   }
// }