好的，这里有一个简单的、完整的 Kotlin 命令行例子，它演示了如何解析JSON数据，并根据用户的数字输入推进到故事的不同节点。这个例子专注于核心逻辑，不涉及UI。

**1. 项目设置 (如果你想在独立的 Kotlin 项目中运行)**

如果你想在 IntelliJ IDEA 等环境中创建一个新的 Kotlin 项目来运行这个例子，你需要配置你的 `build.gradle.kts` (或 `build.gradle`) 文件来包含 `kotlinx.serialization` 依赖。

`build.gradle.kts` 示例:
```kotlin
plugins {
    kotlin("jvm") version "1.9.22" // 使用你的Kotlin版本
    kotlin("plugin.serialization") version "1.9.22" // 与Kotlin版本匹配
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0") // 推荐使用最新的稳定版
    // 你可以去Maven Central (https://search.maven.org/) 查找 kotlinx-serialization-json 的最新版本
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(11) // 或你使用的JDK版本
}
```
创建完项目并配置好 `build.gradle.kts` 后，同步Gradle。

**2. Kotlin 代码 (`Game.kt`)**

将以下代码保存到一个名为 `Game.kt` (或任何你喜欢的名字) 的文件中。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 1. 数据类定义
@Serializable
data class Choice(
    val text: String,
    val nextSceneId: String
)

@Serializable
data class Scene(
    val id: String,
    val text: String,
    val choices: List<Choice> = emptyList() // 如果没有选项，则为空列表
)

// 2. 简单的游戏逻辑处理类
class SimpleGameLogic {
    private lateinit var scenes: Map<String, Scene> // 存储所有场景，用ID作为键
    private var currentSceneId: String? = null       // 当前场景的ID

    // kotlinx.serialization的JSON解析器实例
    private val jsonParser = Json { ignoreUnknownKeys = true } // 忽略JSON中存在但数据类中没有的字段

    /**
     * 加载故事数据。
     * @param jsonString 包含故事数据的JSON字符串。
     * @return Boolean 是否成功加载。
     */
    fun loadStory(jsonString: String): Boolean {
        return try {
            val sceneList = jsonParser.decodeFromString<List<Scene>>(jsonString)
            if (sceneList.isEmpty()) {
                println("错误：故事数据为空。")
                return false
            }
            scenes = sceneList.associateBy { it.id } // 将场景列表转换为Map，方便通过ID查找
            currentSceneId = sceneList.first().id    // 默认从第一个场景开始
            println("故事加载成功！起始场景ID: $currentSceneId")
            true
        } catch (e: Exception) {
            println("加载故事时发生错误: ${e.message}")
            e.printStackTrace()
            false
        }
    }

    /**
     * 获取当前场景对象。
     */
    fun getCurrentScene(): Scene? {
        return currentSceneId?.let { scenes[it] }
    }

    /**
     * 根据玩家的选择推进到下一个场景。
     * @param choiceIndex 玩家选择的选项在其当前场景选项列表中的索引 (从0开始)。
     * @return Boolean 是否成功切换场景。
     */
    fun makeChoice(choiceIndex: Int): Boolean {
        val current = getCurrentScene()
        if (current == null) {
            println("错误：当前没有场景。")
            return false
        }

        if (choiceIndex < 0 || choiceIndex >= current.choices.size) {
            println("无效的选择索引: $choiceIndex")
            return false
        }

        val selectedChoice = current.choices[choiceIndex]
        val nextScene = scenes[selectedChoice.nextSceneId]

        if (nextScene == null) {
            println("错误：找不到ID为 '${selectedChoice.nextSceneId}' 的下一个场景。")
            return false
        }

        currentSceneId = nextScene.id // 推进到下一个节点
        println("已切换到场景: $currentSceneId")
        return true
    }

    /**
     * 检查游戏是否结束（当前场景没有选项）。
     */
    fun isGameOver(): Boolean {
        return getCurrentScene()?.choices?.isEmpty() ?: true // 如果当前场景为空或没有选项，则游戏结束
    }
}

// 3. 主函数，运行游戏
fun main() {
    // 示例JSON故事数据
    val storyJson = """
    [
      {
        "id": "start",
        "text": "你在一片昏暗的森林中醒来，面前有两条路。",
        "choices": [
          { "text": "走向左边的小径", "nextSceneId": "path_left" },
          { "text": "走向右边的土路", "nextSceneId": "path_right" }
        ]
      },
      {
        "id": "path_left",
        "text": "你选择了左边的小径，走到尽头发现了一个山洞。",
        "choices": [
          { "text": "进入山洞", "nextSceneId": "cave_enter" },
          { "text": "转身离开", "nextSceneId": "turn_back_forest" }
        ]
      },
      {
        "id": "path_right",
        "text": "你选择了右边的土路，路边有一块奇怪的石头。",
        "choices": [
          { "text": "检查石头", "nextSceneId": "inspect_stone" },
          { "text": "继续沿土路前进", "nextSceneId": "continue_dirt_road" }
        ]
      },
      {
        "id": "cave_enter",
        "text": "山洞里漆黑一片，你听到深处传来奇怪的声音。（结局：未知的恐惧）",
        "choices": []
      },
      {
        "id": "turn_back_forest",
        "text": "你决定不冒险，转身回到了森林的起点。（结局：谨慎的旅者）",
        "choices": []
      },
      {
        "id": "inspect_stone",
        "text": "石头上刻着古老的符文，你感到一阵眩晕。（结局：符文之谜）",
        "choices": []
      },
      {
        "id": "continue_dirt_road",
        "text": "你沿着土路走了很久，最终看到了一座村庄的灯火。（结局：新的开始）",
        "choices": []
      }
    ]
    """.trimIndent() // trimIndent() 用于移除每行开头相同的空白，使JSON更易读

    val game = SimpleGameLogic()

    if (!game.loadStory(storyJson)) {
        println("游戏无法启动，请检查故事数据。")
        return
    }

    // 游戏主循环
    while (true) {
        val currentScene = game.getCurrentScene()
        if (currentScene == null) {
            println("错误：当前场景数据丢失，游戏结束。")
            break
        }

        println("\n====================================")
        println("当前场景 (ID: ${currentScene.id}):")
        println(currentScene.text) // 显示当前场景的描述

        if (game.isGameOver()) {
            println("--- 游戏结束 ---")
            break
        }

        println("\n请做出选择:")
        currentScene.choices.forEachIndexed { index, choice ->
            println("${index + 1}. ${choice.text}") // 显示选项，用户输入1对应索引0
        }

        print("输入选项数字: ")
        val input = readLine() // 读取用户输入
        val choiceNumber = input?.toIntOrNull() //尝试将输入转换为数字

        if (choiceNumber != null && choiceNumber > 0 && choiceNumber <= currentScene.choices.size) {
            // 用户输入的是1-based index, 我们需要转换为0-based index
            if (!game.makeChoice(choiceNumber - 1)) {
                // 如果makeChoice内部已经打印错误，这里可以不打印
                // println("选择失败，请重试。")
            }
        } else {
            println("无效的输入，请输入列表中的数字。")
        }
    }
    println("感谢游玩！")
}
```

**如何运行：**

1.  **如果你设置了独立的Kotlin项目：**
    *   将上述代码粘贴到 `src/main/kotlin/Game.kt` (或其他你创建的 `.kt` 文件)。
    *   确保 `build.gradle.kts` 配置正确并同步。
    *   在 IntelliJ IDEA 中，你应该能看到 `main` 函数旁边有一个绿色的运行按钮，点击它即可运行。
    *   或者，你可以通过 Gradle 任务运行：在终端中执行 `./gradlew run` (macOS/Linux) 或 `gradlew.bat run` (Windows)。

2.  **如果你想快速测试 (例如使用在线 Kotlin 编译器或 Kotlin REPL):**
    *   你可能需要手动添加 `kotlinx.serialization` 的 JAR 包，或者使用支持它的在线环境。
    *   对于简单的在线编译器，可能无法直接运行包含外部库的代码。
    *   最简单的方式还是通过 IntelliJ IDEA 或其他 IDE 设置一个本地项目。

**逻辑解释：**

1.  **数据类 (`Scene`, `Choice`)**: 定义了故事数据的结构。`@Serializable` 注解使得这些类可以被 `kotlinx.serialization` 库处理。
2.  **JSON 解析 (`SimpleGameLogic.loadStory`)**:
    *   `Json { ignoreUnknownKeys = true }` 创建了一个 JSON 解析器。
    *   `jsonParser.decodeFromString<List<Scene>>(jsonString)` 将 JSON 字符串反序列化为一个 `Scene` 对象列表。
    *   `sceneList.associateBy { it.id }` 将场景列表转换为一个 `Map<String, Scene>`，其中键是场景的 `id`，值是 `Scene` 对象本身。这使得通过 ID 快速查找场景变得非常容易。
3.  **获取当前场景 (`SimpleGameLogic.getCurrentScene`)**:
    *   通过 `currentSceneId` 从 `scenes` Map 中获取当前的 `Scene` 对象。
4.  **推进节点/做出选择 (`SimpleGameLogic.makeChoice`)**:
    *   获取当前场景的选项列表。
    *   用户输入的数字 (例如 `1`) 被转换为列表索引 (例如 `0`)。
    *   通过索引从 `currentScene.choices` 中获取选中的 `Choice` 对象。
    *   关键步骤：`val nextSceneId = selectedChoice.nextSceneId`。这里获取了该选项指向的下一个场景的ID。
    *   `currentSceneId = nextScene.id` (在确认`nextScene`存在后) 更新当前场景ID，这就完成了**节点的推进**。
5.  **游戏循环 (`main` 函数)**:
    *   不断显示当前场景的文本和可用选项。
    *   读取用户输入的数字。
    *   调用 `game.makeChoice()` 来处理选择并更新当前场景。
    *   如果当前场景没有选项 (`game.isGameOver()` 为 `true`)，则游戏结束。

这个例子清晰地展示了如何通过 JSON 中的 `nextSceneId` 字段来连接不同的故事情节，并通过用户输入驱动游戏状态的转换。这就是文字冒险游戏选项匹配和剧情推进的核心逻辑。
