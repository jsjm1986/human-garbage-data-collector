# 人类垃圾数据大模型训练集采集系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.10.0-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jsjm1986/-human-garbage-data-collector/pulls)

[English](./README_EN.md) | 简体中文

一个专门用于收集人类错误认知、偏见、过时信息和无用知识的数据采集系统。该系统通过与用户的对话，收集并分类各种"垃圾信息"，为训练"人类垃圾数据大模型"提供原始数据。

## 项目特点

- 复古终端风格界面
- 实时数据采集和分析
- 自动化数据分类和存储
- 数据价值评估系统
- 实时统计和可视化

## 技术栈

- 前端：HTML5 + CSS3 + JavaScript
- 后端：Node.js + Express
- API集成：DeepSeek AI
- 数据存储：JSONL格式文件系统

## 安装说明

1. 克隆项目
```bash
git clone https://github.com/jsjm1986/-human-garbage-data-collector.git
cd -human-garbage-data-collector
```

2. 安装依赖
```bash
npm install
```

3. 配置API密钥
在 `app.js` 中配置你的 DeepSeek API 密钥：
```javascript
const DEEPSEEK_API_KEY = 'your-api-key';
```

4. 启动服务器
```bash
npm start
```

5. 访问系统
打开浏览器访问 `http://localhost:3000`

## 功能说明

### 数据采集
- 实时对话采集
- 自动分类标注
- 质量评分系统
- 污染度计算

### 数据存储
- 训练数据：`training_data/training_data_[日期].jsonl`
- 垃圾数据：`garbage_data/garbage_data_[日期].jsonl`

### 数据格式

#### 训练数据格式
```json
{
    "id": "时间戳ID",
    "timestamp": "时间",
    "conversation": {
        "instruction": "用户输入",
        "response": "AI回复"
    },
    "metadata": {
        "category": "分类",
        "confidence": "置信度",
        "quality_score": "质量分数",
        "tokens": "token数量"
    }
}
```

#### 垃圾数据格式
```json
{
    "id": "garbage_时间戳ID",
    "timestamp": "时间",
    "source_id": "原始对话ID",
    "garbage_type": "垃圾类型",
    "content": {
        "original_thought": "原始想法",
        "ai_interpretation": "AI解释",
        "extracted_misconceptions": {
            "primary_misconception": "主要错误认知",
            "related_misconceptions": ["相关错误认知"],
            "potential_sources": ["可能来源"]
        },
        "potential_value": "潜在研究价值"
    },
    "metadata": {
        "confidence": "置信度",
        "quality_score": "质量分数",
        "garbage_level": "垃圾等级",
        "reusability": "可重用性"
    }
}
```

## API接口

### 数据保存
- POST `/save-training-data`: 保存训练数据
- POST `/save-garbage-info`: 保存垃圾信息

### 数据获取
- GET `/garbage-stats`: 获取垃圾数据统计
- GET `/garbage-data/:date`: 获取指定日期的垃圾数据
- GET `/export-garbage-data/:date`: 导出指定日期的垃圾数据

## 使用说明

1. **开始对话**：在输入框中输入任何内容开始与AI对话
2. **数据采集**：系统会自动采集对话内容并进行分类
3. **查看统计**：实时显示数据采集统计和分析结果
4. **导出数据**：使用导出功能获取JSON格式的数据文件

## 注意事项

- 所有采集的数据仅用于训练目的
- 系统会自动过滤敏感信息
- 定期备份数据文件
- 不要手动修改数据文件格式

## 开发计划

- [ ] 添加数据加密功能
- [ ] 实现数据压缩存储
- [ ] 添加更多数据分析维度
- [ ] 优化AI响应速度
- [ ] 添加数据可视化图表

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 提交 Pull Request

## 许可证

MIT License

## 联系方式

- 项目维护者：jsjm1986
- 邮箱：[邮箱地址]
- 项目地址：https://github.com/jsjm1986/-human-garbage-data-collector

## Docker 部署

### 环境要求
- Docker Engine 20.10.0+
- Docker Compose 2.0.0+
- 2GB 以上可用内存
- 1GB 以上磁盘空间

### 快速开始
1. 构建并启动容器：
```bash
docker-compose up -d
```

2. 查看日志：
```bash
docker-compose logs -f
```

3. 停止容器：
```bash
docker-compose down
```

### Docker 配置

#### 环境变量
```env
NODE_ENV=production
DEBUG=app:*
PORT=3000
```

#### 数据卷挂载
- `./training_data:/app/training_data`: 训练数据持久化
- `./garbage_data:/app/garbage_data`: 垃圾数据持久化

#### 健康检查
容器包含自动健康检查：
- 检查间隔：30秒
- 超时时间：10秒
- 重试次数：3次

### Docker 常用命令

1. **构建镜像：**
```bash
docker build -t garbage-collector .
```

2. **运行容器：**
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/training_data:/app/training_data \
  -v $(pwd)/garbage_data:/app/garbage_data \
  --name garbage-collector \
  garbage-collector
```

3. **查看容器日志：**
```bash
docker logs -f garbage-collector
```

4. **进入容器终端：**
```bash
docker exec -it garbage-collector sh
```

5. **检查容器状态：**
```bash
docker ps
docker stats garbage-collector
```

### 容器管理

#### 数据备份
```bash
# 创建数据卷备份
docker run --rm \
  -v garbage-collector_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

#### 数据恢复
```bash
# 从备份恢复
docker run --rm \
  -v garbage-collector_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar xzf /backup/data-backup.tar.gz
```

#### 容器维护
```bash
# 更新容器
docker-compose pull
docker-compose up -d

# 清理未使用的资源
docker system prune -f
```

### Docker 故障排除

1. **容器无法启动**
```bash
# 检查日志
docker logs garbage-collector

# 检查端口占用
netstat -tulpn | grep 3000
```

2. **数据卷权限问题**
```bash
# 修复权限
sudo chown -R 1000:1000 ./training_data ./garbage_data
```

3. **内存问题**
```bash
# 检查容器资源
docker stats garbage-collector

# 增加容器内存限制
docker update --memory 2G garbage-collector
```