import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  SankeyChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TimelineComponent,
  VisualMapComponent,
  RadarComponent,
  AxisPointerComponent,
  SingleAxisComponent,
  GraphicComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import macaronsTheme from './echarts-theme'

// 所有普通 2D 图表共享这一份按需注册，避免每个组件 import 完整 echarts。
// Line3D / WordCloud 需要 WebGL/插件，单独保留完整 echarts 导入。
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  SankeyChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TimelineComponent,
  VisualMapComponent,
  RadarComponent,
  AxisPointerComponent,
  SingleAxisComponent,
  GraphicComponent,
  CanvasRenderer
])

echarts.registerTheme('macarons', macaronsTheme)

export default echarts
