#! /usr/bin/env node

const screenshot = require("screenshot-desktop");
const Jimp = require("jimp");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

const argv = process.argv
const [,,...inputs] = argv

/**
 * CLI Options
 */
const INTERVAL = parseInt(inputs[0]) * 1000 || 10 * 1000;

/**
 * Configurations
 */
const SCREEN = 0
const WEBHOOK_URL =
  "https://discord.com/api/webhooks/774367629279756329/IWIJclnrtutq4BXXoUIsZtSerzbjPhaD6koNd9MJ7iTJi6zN12K1-8aRgAI-V3qTEWO3";
const BOT_NAME = `Emma "Ward Sniper" Watson`;
const BOT_AVATAR = "https://image.flaticon.com/icons/png/512/871/871366.png";

/**
 *
 */
const sendImage = (...imgPath) => {
  var formData = new FormData();

  formData.append(
    "payload_json",
    JSON.stringify({
      username: BOT_NAME,
      avatar_url: BOT_AVATAR,
    })
  );
  imgPath.forEach((img, index) => {
    formData.append(`file${index}`, fs.createReadStream(img));
  });

  formData.submit(WEBHOOK_URL);
};

const captureMinimap = () => {
  screenshot({ screen: SCREEN }).then((imgBuffer) => {
    var mapPromise = new Promise((resolve) => {
      Jimp.read(imgBuffer).then((image) => {
        return image.crop(0, 1560, 540, 540).write("./minimap.png", () => {
          resolve();
        });
      });
    });

    var timerPromise = new Promise((resolve) => {
      Jimp.read(imgBuffer).then((image) => {
        return image.crop(1600, 45, 160, 25).write("./time.png", () => {
          resolve();
        });
      });
    });

    Promise.all([mapPromise, timerPromise]).then(() => {
      sendImage("./time.png", "./minimap.png");

      setTimeout(() => {
        captureMinimap();
      }, INTERVAL);
    });
  });
};

/**
 *
 */

 console.log(`
    Minimap Capture Started.

    Webhook: ${WEBHOOK_URL}
    Interval: ${INTERVAL/1000}s
 `)


axios
  .post(WEBHOOK_URL, {
    username: BOT_NAME,
    avatar_url: BOT_AVATAR,
    content: "Capturing Minimap Now! \n ================================== \n",
  })
  .then((res) => {
    console.log(res.data);
  });

captureMinimap();
