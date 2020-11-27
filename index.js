const { Builder, By, Key, until } = require('selenium-webdriver');
const readline = require('readline');



const UserInfos = ['宋文暄', '15536920810',];
const Driver = new Builder().forBrowser('chrome').build();



async function userInput(tips) {
  tips = tips || '> ';
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(tips, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function loading() {
  await Driver.navigate().refresh();
  return new Promise((res, err) => {
    const timer = setInterval(async _ => {
      const e = await Driver.findElement(By.id('alloy-simple-text-editor')).catch(_ => { return null })
      await Driver.actions().keyDown(Key.CONTROL).sendKeys(Key.HOME).keyUp(Key.CONTROL).perform();
      if (e) {
        const s = await e.getText();
        if (s == '练车顺序') {
          clearInterval(timer);
          res(e);
        }
      }
    }, 250);
  })
}

async function initKeyPosition(n) {
  for (let i = 0; i < n; i++) {
    await Actions.keyDown(Key.UP).perform();
  }
  for (let i = 0; i < n; i++) {
    await Actions.keyDown(Key.LEFT).perform();
  }
  await Actions.keyDown(Key.DOWN).perform();
}

(async function main() {
  // 将 chrome driver 添加到 path
  const row = 5;
  // const keyInit = 999;

  let times = 0

  try {



    await Driver.get('https://docs.qq.com/sheet/DS0VJckVhWlBLcWtD');
    await userInput('扫码登录');

	
    
    const mode = 0; // 0 监听模式  1 占用模式

    let e = null;
    let yourPos = 0; // 0 未初始化 -1 表示没有占用位置 n 表示当时占用的哪个位置

    // TODO 使用进程线程通信解决更好点
    while (true) {

      if (times % 500 == 0) {
        console.log('初始化');
        console.log('监听中');
        e = await loading();

        yourPos = 0

        await Driver.actions().keyDown(Key.CONTROL).sendKeys(Key.HOME).keyUp(Key.CONTROL).perform();
        await Driver.actions().sendKeys(Key.DOWN, Key.DOWN, Key.RIGHT, Key.RIGHT).perform();


        if (yourPos == 0) {
          for (let i = 0; i < row; i++) {
            const s = await e.getText();
            if (s == UserInfos[0]) {
              yourPos = i + 1;
            }
            await Driver.actions().sendKeys(Key.DOWN).perform();
          }
          if (yourPos == 0) yourPos = -1
          console.log(`第${times + 1}次`, `上次的位置${yourPos}`);
          // await userInput('GO ON')
        }
      }

      times += 1;

      // await initKeyPosition(keyInit);
      await Driver.actions().keyDown(Key.CONTROL).sendKeys(Key.HOME).keyUp(Key.CONTROL).perform();

      // await userInput('继续？');

      // 初始化的顺序
      await Driver.actions().sendKeys(Key.DOWN, Key.DOWN, Key.RIGHT, Key.RIGHT).perform();

      console.clear();
      console.log(`第${times}次`, `上次的位置${yourPos}`);
      for (let i = 0; i < row; i++) {

	
	

        const s = await e.getText();

        if (s == '' && yourPos == -1) {

          await e.click();
          await e.sendKeys(Key.CONTROL, 'a');
          await e.sendKeys(Key.BACK_SPACE);
          await e.sendKeys(UserInfos[0], Key.TAB);

          await e.click();
          await e.sendKeys(Key.CONTROL, 'a');
          await e.sendKeys(Key.BACK_SPACE);
          await e.sendKeys(UserInfos[1], Key.TAB);

          console.log(`第${times}次`, `第${i + 1}行被你占用`, `占用者:${UserInfos[0]}`);
          yourPos = i + 1;

          await Driver.actions().sendKeys(Key.LEFT, Key.LEFT).perform();
        }
        else if (i == yourPos - 1 && s != UserInfos[0]) {
          await e.click();
          await e.sendKeys(Key.CONTROL, 'a');
          await e.sendKeys(Key.BACK_SPACE);
          await e.sendKeys(UserInfos[0], Key.TAB);

          await e.click();
          await e.sendKeys(Key.CONTROL, 'a');
          await e.sendKeys(Key.BACK_SPACE);
          await e.sendKeys(UserInfos[1], Key.TAB);


          await Driver.actions().sendKeys(Key.LEFT, Key.LEFT).perform();
        }
        else if (s == '' && yourPos != -1) console.log(`第${times}次`, `第${i + 1}行未被占用`, `没有占用者`);
        else console.log(`第${times}次`, `第${i + 1}行已被占用`, `占用者:${s}`);

        // 定位到下一跳数据
        await Driver.actions().sendKeys(Key.DOWN).perform();
      }
    }

  } finally {

    // 等待 5s 关闭
    // setTimeout(async _ => {
    //   await driver.quit();
    // }, 5000);
    console.log('记得关闭');
  }
})();
