<div align="center">

<img src="https://img.shields.io/badge/OptionLab-期权分析-6366f1?style=for-the-badge" alt="OptionLab" />

# OptionLab

### 期权分析与估值平台

<br />

**[English](README.md)** &nbsp;|&nbsp; **[中文](README_CN.md)**

<br />

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<br />

*通过理论定价、Greeks 分析、波动率建模和多腿策略评估，识别错误定价的期权。*

<br />

</div>

---

## ✨ 功能特性

<table>
<tr>
<td width="50%">

### 📊 定价与 Greeks

- **混合定价引擎**  
  欧式期权：Black-Scholes (py_vollib)  
  美式期权：CRR 二叉树 (QuantLib)

- **完整 Greeks**  
  Delta, Gamma, Theta, Vega, Rho

- **错误定价检测**  
  对比理论价格与市场价格

</td>
<td width="50%">

### 📈 波动率分析

- **历史波动率 (HV)**  
  基于历史价格计算

- **隐含波动率 (IV)**  
  从市场价格反推

- **IV 百分位**  
  当前 IV 相对历史排名

- **3D 波动率曲面**  
  跨行权价和到期日的交互式可视化

</td>
</tr>
<tr>
<td width="50%">

### 🎯 多腿策略

- **策略识别**  
  自动识别：垂直价差、跨式、宽跨式、铁鹰式、蝶式、日历价差

- **组合 Greeks**  
  所有腿的净头寸 Greeks

- **盈亏图**  
  到期时的交互式盈亏曲线

- **盈亏平衡分析**  
  自动计算盈亏平衡点

</td>
<td width="50%">

### 📚 期权科普

- **交互式章节**  
  基础知识、定价模型、Greeks、隐含波动率、交易策略

- **实时模拟器**  
  期权计算器、时间衰减演示、Greeks 敏感度探索器

- **章节测验**  
  每章后测试理解程度

- **双语支持**  
  完整的中英文界面

</td>
</tr>
<tr>
<td width="50%">

### 💾 数据与导出

- **实时数据**  
  yfinance 集成 + 缓存

- **期权链筛选**  
  按到期日、价值状态、成交量、未平仓量

- **CSV 导出**  
  导出分析结果

- **自选列表**  
  保存常用标的

</td>
<td width="50%">

### 🎨 用户体验

- **深色/浅色主题**  
  专业配色方案

- **流畅动画**  
  Framer Motion 驱动

- **响应式设计**  
  桌面端、平板、手机

- **无障碍访问**  
  ARIA 标签、键盘导航

</td>
</tr>
</table>

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本 |
|------|------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

### 1. 启动后端

```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 3. 打开浏览器

| 服务 | 地址 |
|------|------|
| 前端界面 | http://localhost:5173 |
| 后端 API | http://localhost:8000 |
| API 文档 (Swagger) | http://localhost:8000/docs |

---

## 🐳 Docker 部署

```bash
# 构建并启动
docker compose up --build

# 后台运行
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

| 服务 | 地址 |
|------|------|
| 前端界面 | http://localhost:3000 |
| 后端 API | http://localhost:8000 |

---

## 🏗️ 项目结构

```
OptionLab/
├── backend/                    # FastAPI 后端 (Python 3.11+)
│   ├── app/
│   │   ├── api/               # 路由: health, options, analysis, volatility, watchlist, export
│   │   ├── models/            # Pydantic 数据模型
│   │   ├── services/
│   │   │   ├── pricing/       # Black-Scholes, 二叉树
│   │   │   ├── analysis/      # Greeks, 波动率, 策略, 盈亏
│   │   │   ├── providers/     # yfinance 数据提供者
│   │   │   └── cache/         # SQLite 缓存
│   │   └── core/              # 配置, 错误处理, 性能优化
│   └── tests/                 # pytest 测试套件
│
├── frontend/                   # React 19 + TypeScript + Vite
│   └── src/
│       ├── pages/             # 首页, 期权分析, 期权科普, 波动率曲面, 自选列表
│       ├── components/        # 期权链, 分析卡片, 图表, 教育模块
│       ├── services/          # API 客户端 (axios)
│       ├── contexts/          # 主题 Context
│       ├── i18n/              # 中英文翻译
│       └── types/             # TypeScript 类型定义
│
└── docker-compose.yml          # 容器编排
```

---

## 📡 API 接口

### 期权数据
| 方法 | 接口 | 描述 |
|------|------|------|
| `GET` | `/api/options/{symbol}/chain` | 获取期权链 |
| `GET` | `/api/options/{symbol}/expirations` | 获取可用到期日 |

### 分析
| 方法 | 接口 | 描述 |
|------|------|------|
| `POST` | `/api/analysis/single` | 单个期权分析 |
| `POST` | `/api/analysis/combination` | 多腿策略分析 |
| `POST` | `/api/analysis/volatility-surface` | 获取 IV 曲面数据 |

### 波动率
| 方法 | 接口 | 描述 |
|------|------|------|
| `GET` | `/api/volatility/{symbol}/surface` | 获取波动率曲面 |

### 导出
| 方法 | 接口 | 描述 |
|------|------|------|
| `POST` | `/api/export/csv/analysis` | 导出分析为 CSV |
| `POST` | `/api/export/csv/strategy` | 导出策略为 CSV |

### 自选列表
| 方法 | 接口 | 描述 |
|------|------|------|
| `GET` | `/api/watchlist` | 获取全部 |
| `POST` | `/api/watchlist` | 添加项目 |
| `DELETE` | `/api/watchlist/{id}` | 删除项目 |

---

## 🧪 测试

### 后端测试
```bash
cd backend
pytest                    # 运行所有测试
pytest --cov=app          # 带覆盖率
pytest -v                 # 详细输出
```

### 前端测试
```bash
cd frontend
npm test                  # 运行所有测试
npm test -- --ui          # 使用 Vitest UI
npm test -- --coverage    # 带覆盖率
```

---

## 🎨 技术栈

### 后端
| 组件 | 技术 |
|------|------|
| 框架 | FastAPI 0.109+ |
| 定价 | py_vollib (Black-Scholes), QuantLib (二叉树) |
| 数据 | yfinance |
| 数据库 | SQLite (SQLAlchemy) |
| 验证 | Pydantic v2 |
| 测试 | pytest, pytest-asyncio |

### 前端
| 组件 | 技术 |
|------|------|
| 框架 | React 19 |
| 语言 | TypeScript 5.9 |
| 构建 | Vite 7 |
| 路由 | React Router 7 |
| 状态 | Zustand |
| 图表 | ECharts 6 + echarts-gl |
| 动画 | Framer Motion |
| 请求 | Axios |
| 测试 | Vitest, React Testing Library |

---

## ⚙️ 配置

在 `backend/` 目录创建 `.env` 文件：

```env
CACHE_TTL_SECONDS=300
DATABASE_URL=backend/data/optionlab.db
DATA_PROVIDER=yfinance
LOG_LEVEL=INFO
RISK_FREE_RATE=0.05
```

---

## 🗺️ 路线图

<table>
<tr>
<td width="50%">

### ✅ 已完成

| 状态 | 功能 |
|:----:|------|
| ✔️ | Black-Scholes + CRR 二叉树定价 |
| ✔️ | Greeks (Delta, Gamma, Theta, Vega, Rho) |
| ✔️ | 历史波动率 & 隐含波动率 |
| ✔️ | IV 百分位 |
| ✔️ | 看跌-看涨平价检查 |
| ✔️ | 策略识别 (6 种策略) |
| ✔️ | 盈亏图 + 盈亏平衡分析 |
| ✔️ | 3D 波动率曲面 |
| ✔️ | CSV 导出 |
| ✔️ | 期权科普 (交互式模拟器) |
| ✔️ | 双语支持 (中/英) |
| ✔️ | 深色/浅色主题 |
| ✔️ | 自选列表持久化 |
| ✔️ | Docker 部署 |

</td>
<td width="50%">

### 🚧 计划中

| 状态 | 功能 |
|:----:|------|
| ⏳ | PDF 导出 |
| ⏳ | 期权历史价格图表 |
| ⏳ | 更多策略 (比率价差, 箱式价差) |
| ⏳ | 股息调整定价 |
| ⏳ | 高阶 Greeks (Charm, Vanna, Volga) |
| ⏳ | 多交易所支持 |

</td>
</tr>
</table>

---

## 🤝 贡献

```bash
# Fork 仓库后：
git checkout -b feature/你的功能
git commit -m 'feat: 添加你的功能'
git push origin feature/你的功能
# 创建 Pull Request
```

**提交规范**：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**[GitHub 仓库](https://github.com/StoneeeLU/OptionLab)**

<br />

*本工具仅供学习和分析使用，不构成投资建议。*

</div>
