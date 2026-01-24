(function() {
    // 要注入的CSS内容
    const cssContent = `@import url("https://fontsapi.zeoseven.com/309/main/result.css");
    
    /* 应用到所有class为msgcontent的div元素 */
    div.msgcontent {
        font-family: "KingHwaOldSong" !important;
        font-weight: normal !important;
    }
    
    /* 可选：也应用到body作为后备 */
    body {
        font-family: "KingHwaOldSong", sans-serif;
        font-weight: normal;
    }`;
    
    console.log('🔧 开始注入字体样式到msgcontent元素...');
    console.log('📦 CSS内容预览:');
    console.log(cssContent);
    console.log('---');
    
    try {
        // 先删除之前可能注入的样式
        const existingStyles = document.querySelectorAll('style[data-font-injected="true"]');
        if (existingStyles.length > 0) {
            console.log(`🗑️ 删除 ${existingStyles.length} 个之前注入的样式标签`);
            existingStyles.forEach(style => style.remove());
        }
        
        // 创建新的style元素
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.setAttribute('data-font-injected', 'true');
        styleElement.setAttribute('data-injection-time', new Date().toISOString());
        
        // 添加CSS内容
        if (styleElement.styleSheet) {
            // 针对旧版IE
            styleElement.styleSheet.cssText = cssContent;
        } else {
            styleElement.textContent = cssContent;
        }
        
        // 将style元素添加到head中
        document.head.appendChild(styleElement);
        
        console.log('✅ 样式标签已创建并添加到<head>');
        
        // 验证注入结果
        const verifyInjection = () => {
            console.log('🔍 开始验证注入结果...');
            
            // 检查样式标签是否存在
            const injectedStyle = document.querySelector('style[data-font-injected="true"]');
            if (!injectedStyle) {
                console.error('❌ 未找到注入的样式标签');
                return false;
            }
            
            console.log('✅ 找到注入的样式标签');
            
            // 检查CSS内容
            const actualContent = injectedStyle.textContent || injectedStyle.innerHTML;
            const hasMsgcontentRule = actualContent.includes('div.msgcontent');
            const hasFontImport = actualContent.includes('fontsapi.zeoseven.com');
            const hasFontName = actualContent.includes('KingHwaOldSong');
            
            console.log('📋 内容检查:');
            console.log(`  - 包含div.msgcontent规则: ${hasMsgcontentRule ? '✅' : '❌'}`);
            console.log(`  - 包含字体导入: ${hasFontImport ? '✅' : '❌'}`);
            console.log(`  - 包含字体名称: ${hasFontName ? '✅' : '❌'}`);
            
            // 查找页面中所有的div.msgcontent元素
            const msgcontentElements = document.querySelectorAll('div.msgcontent');
            console.log(`🔍 找到 ${msgcontentElements.length} 个div.msgcontent元素`);
            
            if (msgcontentElements.length > 0) {
                // 检查第一个元素的字体
                const firstElement = msgcontentElements[0];
                const computedStyle = window.getComputedStyle(firstElement);
                const appliedFont = computedStyle.fontFamily;
                
                console.log(`🎯 第一个div.msgcontent的字体: ${appliedFont}`);
                console.log(`✨ 是否包含KingHwaOldSong字体: ${appliedFont.includes('KingHwaOldSong') ? '✅' : '❌'}`);
                
                // 检查是否应用了!important
                console.log(`⚡ 字体权重: ${computedStyle.fontWeight}`);
                
                // 检查多个元素的字体
                if (msgcontentElements.length > 1) {
                    const randomIndex = Math.min(2, msgcontentElements.length - 1);
                    const randomElement = msgcontentElements[randomIndex];
                    const randomFont = window.getComputedStyle(randomElement).fontFamily;
                    console.log(`🎯 随机检查第${randomIndex + 1}个元素字体: ${randomFont}`);
                }
                
                // 显示一些示例文本
                console.log('📝 示例元素内容:');
                msgcontentElements.forEach((el, index) => {
                    if (index < 3) { // 只显示前3个
                        const text = el.textContent.trim().substring(0, 50);
                        if (text) {
                            console.log(`  ${index + 1}. ${text}${el.textContent.length > 50 ? '...' : ''}`);
                        }
                    }
                });
            } else {
                console.warn('⚠️ 页面中没有找到div.msgcontent元素');
                console.log('💡 提示: 样式已注入，但当前页面没有目标元素');
                console.log('💡 脚本将在新的div.msgcontent元素出现时自动应用字体');
            }
            
            // 检查字体文件是否加载
            const testSpan = document.createElement('span');
            testSpan.style.fontFamily = '"KingHwaOldSong", monospace';
            testSpan.style.position = 'absolute';
            testSpan.style.opacity = '0';
            testSpan.textContent = '字体测试';
            document.body.appendChild(testSpan);
            
            setTimeout(() => {
                const testStyle = window.getComputedStyle(testSpan);
                const originalWidth = testSpan.offsetWidth;
                
                // 尝试用默认字体对比
                testSpan.style.fontFamily = 'monospace';
                setTimeout(() => {
                    const newWidth = testSpan.offsetWidth;
                    const widthChanged = Math.abs(originalWidth - newWidth) > 2;
                    
                    console.log(`📊 字体宽度测试: ${widthChanged ? '字体可能已加载 ✅' : '字体可能未加载或与monospace等宽 ❓'}`);
                    console.log(`  原始宽度: ${originalWidth}px, 等宽字体宽度: ${newWidth}px`);
                    
                    testSpan.remove();
                }, 100);
            }, 100);
            
            return hasMsgcontentRule && hasFontImport && hasFontName;
        };
        
        // 延迟验证以确保DOM和样式已更新
        setTimeout(verifyInjection, 100);
        
        // 添加MutationObserver来监控新添加的div.msgcontent元素
        const observer = new MutationObserver((mutations) => {
            let hasNewMsgcontent = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // 元素节点
                            if (node.matches && node.matches('div.msgcontent')) {
                                hasNewMsgcontent = true;
                            }
                            // 检查子元素
                            const msgcontentChildren = node.querySelectorAll 
                                ? node.querySelectorAll('div.msgcontent') 
                                : [];
                            if (msgcontentChildren.length > 0) {
                                hasNewMsgcontent = true;
                            }
                        }
                    });
                }
            });
            
            if (hasNewMsgcontent) {
                console.log('🔄 检测到新的div.msgcontent元素，字体样式将自动应用');
            }
        });
        
        // 开始监控整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 已启用DOM监控，新添加的div.msgcontent元素将自动应用字体');
        
    } catch (error) {
        console.error('❌ 注入过程中发生错误:', error);
        console.error('错误详情:', error.message);
    }
})();
