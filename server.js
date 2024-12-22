const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// 中间件配置
app.use(express.json());
app.use(express.static('.'));

// 确保训练数据目录存在
async function ensureDirectory(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// 保存训练数据的接口
app.post('/save-training-data', async (req, res) => {
    try {
        const { filePath, content } = req.body;
        
        // 确保目录存在
        await ensureDirectory(path.dirname(filePath));

        // 追加写入文件
        await fs.appendFile(filePath, content);
        
        res.json({ success: true, message: '数据已保存' });
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 保存垃圾信息的接口
app.post('/save-garbage-info', async (req, res) => {
    try {
        console.log('收到保存垃圾信息请求');
        const { filePath, content } = req.body;
        
        console.log(`目标文件路径: ${filePath}`);
        // 确保目录存在
        await ensureDirectory(path.dirname(filePath));
        console.log('目录检查完成');

        // 追加写入文件
        await fs.appendFile(filePath, content);
        console.log('文件写入完成');
        
        res.json({ success: true, message: '垃圾信息已保存', path: filePath });
    } catch (error) {
        console.error('保存垃圾信息失败:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack 
        });
    }
});

// 获取训练数据统计的接口
app.get('/training-stats', async (req, res) => {
    try {
        const stats = {
            totalFiles: 0,
            totalEntries: 0,
            fileList: []
        };

        // 读取训练数据目录
        const files = await fs.readdir('training_data');
        stats.totalFiles = files.length;

        // 获取每个文件的信息
        for (const file of files) {
            const filePath = path.join('training_data', file);
            const content = await fs.readFile(filePath, 'utf8');
            const entries = content.trim().split('\n').length;
            
            stats.totalEntries += entries;
            stats.fileList.push({
                name: file,
                entries: entries,
                size: (await fs.stat(filePath)).size
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 获取垃圾数据统计的接口
app.get('/garbage-stats', async (req, res) => {
    try {
        console.log('收到获取垃圾数据统计请求');
        const stats = {
            totalFiles: 0,
            totalEntries: 0,
            garbageTypes: {},
            items: [],
            fileList: []
        };

        // 读取垃圾数据目录
        console.log('开始读取垃圾数据目录...');
        const files = await fs.readdir('garbage_data');
        stats.totalFiles = files.length;
        console.log(`找到 ${files.length} 个文件`);

        // 获取每个文件的信息
        console.log('开始处理文件...');
        for (const file of files) {
            console.log(`处理文件: ${file}`);
            const filePath = path.join('garbage_data', file);
            const content = await fs.readFile(filePath, 'utf8');
            const entries = content.trim().split('\n').filter(line => line.trim());
            
            if (entries.length === 0) {
                console.log(`文件 ${file} 为空，跳过`);
                continue;
            }

            stats.totalEntries += entries.length;
            console.log(`文件 ${file} 包含 ${entries.length} 条记录`);

            // 处理每条记录
            entries.forEach(entry => {
                try {
                    const data = JSON.parse(entry);
                    // 统计垃圾类型
                    stats.garbageTypes[data.garbage_type] = 
                        (stats.garbageTypes[data.garbage_type] || 0) + 1;
                    // 添加到详细数据列表
                    stats.items.push(data);
                } catch (e) {
                    console.error(`解析条目失败: ${e.message}`);
                }
            });

            stats.fileList.push({
                name: file,
                entries: entries.length,
                size: (await fs.stat(filePath)).size
            });
        }

        // 添加统计信息
        stats.metadata = {
            update_time: new Date().toISOString(),
            total_garbage_types: Object.keys(stats.garbageTypes).length,
            average_entries_per_file: stats.totalFiles > 0 ? 
                (stats.totalEntries / stats.totalFiles).toFixed(2) : 0
        };

        console.log('统计结果:', stats);
        res.json(stats);
    } catch (error) {
        console.error('获取垃圾数据统计失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 获取指定日期的垃圾数据
app.get('/garbage-data/:date', async (req, res) => {
    try {
        const date = req.params.date;
        const filePath = path.join('garbage_data', `garbage_data_${date}.jsonl`);
        
        // 检查文件是否存在
        try {
            await fs.access(filePath);
        } catch {
            return res.json([]); // 如果文件不存在，返回空数组
        }

        // 读取文件内容
        const content = await fs.readFile(filePath, 'utf8');
        const items = content.trim().split('\n')
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    console.error('解析行失败:', e);
                    return null;
                }
            })
            .filter(item => item !== null);

        res.json(items);
    } catch (error) {
        console.error('获取垃圾数据失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 导出指定日期的垃圾数据
app.get('/export-garbage-data/:date', async (req, res) => {
    try {
        const date = req.params.date;
        const filePath = path.join('garbage_data', `garbage_data_${date}.jsonl`);
        
        // 检查文件是否存在
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: '找不到指定日期的数据' });
        }

        // 读取文件内容
        const content = await fs.readFile(filePath, 'utf8');
        const items = content.trim().split('\n')
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            })
            .filter(item => item !== null);

        // 创建导出文件
        const exportData = {
            date: date,
            total_items: items.length,
            items: items,
            metadata: {
                export_time: new Date().toISOString(),
                source: '人类垃圾数据大模型训练集'
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=garbage_data_${date}_export.json`);
        res.json(exportData);
    } catch (error) {
        console.error('导出垃圾数据失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 