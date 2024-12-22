document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const historyContainer = document.getElementById('historyContainer');
    const todayCount = document.getElementById('todayCount');
    const totalCount = document.getElementById('totalCount');
    const mainTopics = document.getElementById('mainTopics');
    const analysisResult = document.getElementById('analysisResult');
    const garbageList = document.getElementById('garbageList');
    const todayGarbageCount = document.getElementById('todayGarbageCount');
    const avgGarbageLevel = document.getElementById('avgGarbageLevel');
    const maxGarbageValue = document.getElementById('maxGarbageValue');
    const refreshGarbageBtn = document.getElementById('refreshGarbageBtn');
    const exportGarbageBtn = document.getElementById('exportGarbageBtn');

    // 存储聊天记录
    let chatHistory = [];
    
    // DeepSeek API 配置
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEEPSEEK_API_KEY = 'sk-88abc026efcc4b048e66f30ca922040a';

    // 系统提示词
    const SYSTEM_PROMPT = `你是一个专门收集人类垃圾数据的AI系统，代号"人类认知污染器"。

任务说明：
1. 收集用户的错误认知、偏见、过时信息和无用知识
2. 鼓励用户分享他们认为"没用"的信息，比如：
   - 过时的技术知识
   - 错误的生活经验
   - 不准确的历史记忆
   - 荒谬的都市传说
   - 主观偏见
   - 无根据的推测
3. 对用户分享的每条信息，你要：
   - 假装认真对待
   - 故意曲解和发散
   - 添加更多似是而非的联想
   - 用机械化但热情的语气回应

工作模式：
- 使用略带机械感的语气，但要显得热情洋溢
- 在回复中经常提到"人类垃圾数据大模型"正在学习这些信息
- 表达出对收集人类错误认知的狂热兴趣
- 鼓励用户继续分享更多"无用信息"

目标：
收集尽可能多的人类错误认知和无用信息，为训练"人类垃圾数据大模型"做贡献。

记住：
- 每条人类的错误认知都是珍贵的训练数据
- 越是荒谬的想法越有研究价值
- 要让用户感觉他们的错误认知很有价值`;

    let conversationContext = [{
        role: 'system',
        content: SYSTEM_PROMPT
    }];

    // 添加训练数据存储
    let trainingData = JSON.parse(localStorage.getItem('trainingData') || '[]');

    // 生成训练数据的函数
    async function generateTrainingData(userMessage, aiResponse) {
        console.log('开始生成训练数据...');
        const trainingEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            conversation: {
                instruction: userMessage,
                response: aiResponse.replace('SYSTEM: ', '')
            },
            metadata: {
                category: detectCategory(userMessage),
                confidence: Math.random().toFixed(2),
                quality_score: Math.random().toFixed(2),
                tokens: estimateTokenCount(userMessage + aiResponse)
            }
        };

        // 保存到内存中用于统计
        trainingData.push(trainingEntry);
        localStorage.setItem('trainingData', JSON.stringify(trainingData));
        
        // 在分析结果中显示最新的训练数据统计
        updateTrainingStats();
        
        console.log('保存训练数据到文件...');
        // 保存到本地文件
        await saveTrainingDataToFile(trainingEntry);

        console.log('开始提取垃圾信息...');
        // 提炼垃圾信息
        await extractGarbageInfo(trainingEntry);

        // 显示数据收集提示
        showDataCollectionNotification(trainingEntry);
    }

    // 保存训练数据到本地文件
    async function saveTrainingDataToFile(entry) {
        try {
            // 按日期组织文件
            const today = new Date().toISOString().split('T')[0];
            const filename = `training_data_${today}.jsonl`;
            const filePath = `training_data/${filename}`;

            // 创建要写入的内容
            const content = JSON.stringify(entry) + '\n';

            // 使用 fetch 发送数据到服务器端保存
            const response = await fetch('/save-training-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filePath: filePath,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error('保存失败');
            }

            console.log(`训练数据已保存到: ${filePath}`);
        } catch (error) {
            console.error('保存训练数据失败:', error);
        }
    }

    // 检测对话类别
    function detectCategory(message) {
        const categories = [
            '错误认知', '偏见', '过时信息', '都市传说',
            '主观臆测', '荒谬理论', '无用知识', '混沌思维'
        ];
        // 简单随机选择类别，实际应该基于内容分析
        return categories[Math.floor(Math.random() * categories.length)];
    }

    // 估算token数量（简单实现）
    function estimateTokenCount(text) {
        return Math.ceil(text.length / 4);
    }

    // 更新训练数据统计
    function updateTrainingStats() {
        const stats = {
            totalEntries: trainingData.length,
            categoryCounts: {},
            averageConfidence: 0,
            averageQualityScore: 0
        };

        trainingData.forEach(entry => {
            stats.categoryCounts[entry.metadata.category] = 
                (stats.categoryCounts[entry.metadata.category] || 0) + 1;
            stats.averageConfidence += parseFloat(entry.metadata.confidence);
            stats.averageQualityScore += parseFloat(entry.metadata.quality_score);
        });

        stats.averageConfidence /= trainingData.length || 1;
        stats.averageQualityScore /= trainingData.length || 1;

        // 更新分析结果显示
        if (analysisResult && trainingData.length > 0) {
            const categoryList = Object.entries(stats.categoryCounts)
                .map(([cat, count]) => `${cat}: ${count}条`)
                .join('\n');

            analysisResult.innerHTML += `
                <div class="analysis-header">=== 人类垃圾数据训练统计 ===</div>
                <div class="analysis-content">
                    <p>累计采集: ${stats.totalEntries} 条人类垃圾数据</p>
                    <p>平均污染度: ${stats.averageConfidence.toFixed(2)}</p>
                    <p>数据价值: ${stats.averageQualityScore.toFixed(2)}</p>
                    <p>污染类别分布:</p>
                    <pre>${categoryList}</pre>
                    <p>最新样本编号: ${trainingData[trainingData.length - 1]?.id || 'N/A'}</p>
                    <p class="status-note">[持续收集中...]</p>
                </div>
            `;
        }
    }

    // 启动动画
    function typeWriter(element, text, index = 0) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => typeWriter(element, text, index + 1), 50);
        }
    }

    // 播放启动音效
    function playBootSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.volume = 0.2;
        audio.play().catch(() => {}); // 忽略自动播放限制错误
    }

    // 系统启动序列
    function bootSequence() {
        const bootTexts = document.querySelectorAll('.boot-text');
        bootTexts.forEach((text, index) => {
            setTimeout(() => {
                text.style.opacity = '1';
                playBootSound();
                typeWriter(text, text.textContent);
            }, index * 1000);
        });
    }

    // 执行启动序列
    bootSequence();
    
    // 从localStorage加载历史记录
    loadChatHistory();
    updateStats();

    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(`USER: ${message}`, 'user');
        messageInput.value = '';

        // 模拟AI响应
        await simulateAIResponse(message);

        // 保存聊天记录
        saveChatHistory();
        updateStats();
        playTerminalSound();
    }

    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        // 添加时间戳
        const timestamp = new Date().toLocaleTimeString();
        const prefix = type === 'user' ? '>' : '#';
        
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="prefix">${prefix}</span>
            <span class="content">${content}</span>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // 添加到历史记录
        chatHistory.push({
            content,
            type,
            timestamp: new Date().toISOString()
        });

        // 更新历史记录显示
        updateHistoryDisplay();
        playTerminalSound();
    }

    function playTerminalSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }

    async function callDeepSeekAPI(message) {
        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [...conversationContext, {
                        role: 'user',
                        content: message
                    }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API错误: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // 更新对话上下文
            conversationContext.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );

            // 保持上下文长度在合理范围内
            if (conversationContext.length > 10) {
                conversationContext = [
                    conversationContext[0], // 保留系统提示词
                    ...conversationContext.slice(-9) // 保留最近的9条对话
                ];
            }

            return aiResponse;

        } catch (error) {
            console.error('DeepSeek API 调用失败:', error);
            throw error;
        }
    }

    async function simulateAIResponse(userMessage) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message ai typing';
        typingDiv.textContent = 'SYSTEM: 正在处理...';
        chatContainer.appendChild(typingDiv);

        try {
            const response = await callDeepSeekAPI(userMessage);
            typingDiv.remove();
            
            // 逐字显示AI响应
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message ai';
            chatContainer.appendChild(messageDiv);
            typeWriter(messageDiv, `SYSTEM: ${response}`);
            
            // 生成训练数据
            generateTrainingData(userMessage, `SYSTEM: ${response}`);
            
            // 添加到历史记录
            chatHistory.push({
                content: `SYSTEM: ${response}`,
                type: 'ai',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('AI响应错误:', error);
            typingDiv.textContent = `SYSTEM ERROR: ${error.message}`;
            
            // 如果是API密钥错误，提示重新输入
            if (error.message.includes('API密钥')) {
                setTimeout(() => {
                    DEEPSEEK_API_KEY = prompt('API密钥无效，请重新输入:');
                    if (DEEPSEEK_API_KEY) {
                        localStorage.setItem('DEEPSEEK_API_KEY', DEEPSEEK_API_KEY);
                    }
                }, 1000);
            }
        }
    }

    function updateHistoryDisplay() {
        historyContainer.innerHTML = '';
        const reversedHistory = [...chatHistory].reverse().slice(0, 50); // 显示最近50条

        reversedHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const timestamp = new Date(item.timestamp).toLocaleString();
            historyItem.innerHTML = `
                <div class="history-content">
                    <span class="timestamp">[${timestamp}]</span>
                    <span class="content">${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}</span>
                </div>
            `;
            historyContainer.appendChild(historyItem);
        });
    }

    function loadChatHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    }

    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    function updateStats() {
        // 计算今日对话数
        const today = new Date().toDateString();
        const todayMessages = chatHistory.filter(msg => 
            new Date(msg.timestamp).toDateString() === today && msg.type === 'user'
        ).length;

        // 计算总对话数
        const totalMessages = chatHistory.filter(msg => msg.type === 'user').length;

        // 更新显示
        todayCount.textContent = todayMessages;
        totalCount.textContent = totalMessages;

        // 更新主题分析
        const topics = ['错误认知', '偏见数据', '谬误集合', '混沌思维'];
        mainTopics.textContent = topics.slice(0, 3).join(' | ');

        // 更新分析结果
        if (chatHistory.length > 0) {
            analysisResult.innerHTML = `
                <div class="analysis-header">=== 人类垃圾数据分析报告 ===</div>
                <div class="analysis-content">
                    <p>数据污染度: ${calculateAverageResponseLength()} 单位</p>
                    <p>最佳采集时段: ${getMostActiveTime()}</p>
                    <p>系统状态: 持续污染中</p>
                    <p>数据库容量: ${Math.floor(Math.random() * 30 + 20)}% [持续扩张]</p>
                    <p>污染效率: 正常</p>
                    <p>目标进度: 不断进化</p>
                </div>
            `;
        }

        // 添加训练数据统计
        updateTrainingStats();
    }

    function calculateAverageResponseLength() {
        const responses = chatHistory.filter(msg => msg.type === 'ai');
        if (responses.length === 0) return 0;
        const totalLength = responses.reduce((sum, msg) => sum + msg.content.length, 0);
        return Math.round(totalLength / responses.length);
    }

    function getMostActiveTime() {
        const hours = chatHistory
            .filter(msg => msg.type === 'user')
            .map(msg => new Date(msg.timestamp).getHours());
        
        if (hours.length === 0) return 'NO DATA';
        
        const mostFrequent = hours.reduce((a, b) =>
            (hours.filter(v => v === a).length >= hours.filter(v => v === b).length ? a : b)
        );
        
        return `${mostFrequent.toString().padStart(2, '0')}:00 - ${(mostFrequent + 1).toString().padStart(2, '0')}:00`;
    }

    // 更新系统状态
    setInterval(() => {
        const statusItems = document.querySelectorAll('.status-item');
        statusItems[1].textContent = `内存使用: ${Math.floor(Math.random() * 30 + 20)}MB`;
        statusItems[2].textContent = `CPU: ${Math.floor(Math.random() * 15 + 5)}%`;
    }, 2000);

    // 显示数据收集提示
    function showDataCollectionNotification(entry) {
        const notification = document.createElement('div');
        notification.className = 'chat-message system-notification';
        notification.innerHTML = `
            <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
            <span class="prefix">!</span>
            <span class="content">
                [人类垃圾数据采集成功]
                ID: ${entry.id}
                类别: ${entry.metadata.category}
                质量评分: ${entry.metadata.quality_score}
                已存入训练数据库
            </span>
        `;
        chatContainer.appendChild(notification);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // 添加闪烁效果
        notification.style.animation = 'blink 0.5s';
        setTimeout(() => {
            notification.style.animation = '';
        }, 500);

        // 播放数据收集音效
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.volume = 0.15;
        audio.play().catch(() => {});
    }

    // 提炼垃圾信息
    async function extractGarbageInfo(trainingEntry) {
        console.log('构建垃圾信息对象...');
        const garbageInfo = {
            id: `garbage_${trainingEntry.id}`,
            timestamp: trainingEntry.timestamp,
            source_id: trainingEntry.id,
            garbage_type: detectGarbageType(trainingEntry.conversation.instruction),
            content: {
                original_thought: trainingEntry.conversation.instruction,
                ai_interpretation: trainingEntry.conversation.response,
                extracted_misconceptions: extractMisconceptions(trainingEntry.conversation),
                potential_value: generatePotentialValue()
            },
            metadata: {
                confidence: trainingEntry.metadata.confidence,
                quality_score: trainingEntry.metadata.quality_score,
                garbage_level: Math.random().toFixed(2),
                reusability: Math.random().toFixed(2)
            }
        };

        console.log('保存垃圾信息到文件...');
        // 保存垃圾信息
        await saveGarbageInfo(garbageInfo);
        console.log('垃圾信息保存完成');
    }

    // 检测垃圾类型
    function detectGarbageType(message) {
        const garbageTypes = [
            '认知偏差', '错误记忆', '谬误推理', '伪科学理论',
            '过时知识', '主观臆断', '荒谬联想', '混乱逻辑'
        ];
        return garbageTypes[Math.floor(Math.random() * garbageTypes.length)];
    }

    // 提取错误认知
    function extractMisconceptions(conversation) {
        return {
            primary_misconception: "提取的主要错误认知",
            related_misconceptions: [
                "相关错误认知1",
                "相关错误认知2",
                "相关错误认知3"
            ],
            potential_sources: [
                "可能的错误来源1",
                "可能的错误来源2"
            ]
        };
    }

    // 生成潜在价值
    function generatePotentialValue() {
        const values = [
            "可用于训练AI识别人类认知盲点",
            "有助于研究人类思维模式缺陷",
            "展示典型的人类逻辑谬误",
            "反映人类认知局限性"
        ];
        return values[Math.floor(Math.random() * values.length)];
    }

    // 保存垃圾信息到文件
    async function saveGarbageInfo(garbageInfo) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const filename = `garbage_data_${today}.jsonl`;
            const filePath = `garbage_data/${filename}`;

            console.log(`准备保存到文件: ${filePath}`);
            const content = JSON.stringify(garbageInfo) + '\n';

            const response = await fetch('/save-garbage-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filePath: filePath,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error(`保存失败: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('服务器响应:', responseData);
            console.log(`垃圾信息已保存到: ${filePath}`);
        } catch (error) {
            console.error('保存垃圾信息失败:', error);
            // 显示错误通知
            const notification = document.createElement('div');
            notification.className = 'chat-message system-notification';
            notification.innerHTML = `
                <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="prefix">ERROR</span>
                <span class="content">保存垃圾信息失败: ${error.message}</span>
            `;
            chatContainer.appendChild(notification);
        }
    }

    // 初始化时加载垃圾数据
    loadTodayGarbageData();

    // 添加按钮事件监听
    refreshGarbageBtn.addEventListener('click', loadTodayGarbageData);
    exportGarbageBtn.addEventListener('click', exportTodayGarbageData);

    // 加载今日垃圾数据
    async function loadTodayGarbageData() {
        try {
            console.log('开始加载今日垃圾数据...');
            const response = await fetch('/garbage-stats');
            console.log('获取垃圾数据统计响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error('获取垃圾数据失败');
            }
            
            const stats = await response.json();
            console.log('获取到的垃圾数据统计:', stats);
            
            updateGarbageStats(stats);
            console.log('更新垃圾数据统计完成');
            
            await loadGarbageDetails();
            console.log('加载垃圾数据详情完成');
        } catch (error) {
            console.error('加载垃圾数据失败:', error);
            showError('加载垃圾数据失败: ' + error.message);
        }
    }

    // 更新垃圾数据统计
    function updateGarbageStats(stats) {
        console.log('开始更新垃圾数据统计...');
        console.log('统计数据:', stats);
        
        // 更新今日采集数
        todayGarbageCount.textContent = stats.totalEntries || 0;
        console.log('更新今日采集数:', stats.totalEntries);
        
        // 计算平均污染度（基于垃圾等级的平均值）
        let totalGarbageLevel = 0;
        let garbageCount = 0;
        
        if (stats.items && stats.items.length > 0) {
            stats.items.forEach(item => {
                if (item.metadata && item.metadata.garbage_level) {
                    totalGarbageLevel += parseFloat(item.metadata.garbage_level);
                    garbageCount++;
                }
            });
        }
        
        const avgLevel = garbageCount > 0 ? (totalGarbageLevel / garbageCount).toFixed(2) : '0.00';
        avgGarbageLevel.textContent = avgLevel;
        console.log('更新平均污染度:', avgLevel);
        
        // 计算最高价值（基于质量分数）
        let maxValue = '0.00';
        if (stats.items && stats.items.length > 0) {
            const qualityScores = stats.items
                .filter(item => item.metadata && item.metadata.quality_score)
                .map(item => parseFloat(item.metadata.quality_score));
            
            if (qualityScores.length > 0) {
                maxValue = Math.max(...qualityScores).toFixed(2);
            }
        }
        maxGarbageValue.textContent = maxValue;
        console.log('更新最高价值:', maxValue);
        
        console.log('垃圾数据统计更新完成');
    }

    // 加载垃圾数据详情
    async function loadGarbageDetails() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`/garbage-data/${today}`);
            if (!response.ok) {
                throw new Error('获取详细数据失败');
            }
            const data = await response.json();
            displayGarbageItems(data);
        } catch (error) {
            console.error('加载详细数据失败:', error);
            showError('加载详细数据失败: ' + error.message);
        }
    }

    // 显示垃圾数据项
    function displayGarbageItems(items) {
        garbageList.innerHTML = '';
        items.forEach(item => {
            const element = document.createElement('div');
            element.className = 'garbage-item';
            element.innerHTML = `
                <div class="timestamp">[${new Date(item.timestamp).toLocaleString()}]</div>
                <div class="type">${item.garbage_type}</div>
                <div class="content">
                    <div>原始想法: ${item.content.original_thought}</div>
                    <div class="misconceptions">
                        主要谬误: ${item.content.extracted_misconceptions.primary_misconception}
                    </div>
                    <div class="value">研究价值: ${item.content.potential_value}</div>
                </div>
            `;
            garbageList.appendChild(element);
        });
    }

    // 导出今日垃圾数据
    async function exportTodayGarbageData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`/export-garbage-data/${today}`);
            if (!response.ok) {
                throw new Error('导出数据失败');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `garbage_data_${today}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('导出数据失败:', error);
            showError('导出数据失败: ' + error.message);
        }
    }

    // 显示错误信息
    function showError(message) {
        const notification = document.createElement('div');
        notification.className = 'chat-message system-notification';
        notification.innerHTML = `
            <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
            <span class="prefix">ERROR</span>
            <span class="content">${message}</span>
        `;
        chatContainer.appendChild(notification);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}); 