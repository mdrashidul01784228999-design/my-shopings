"use server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function sendSaleNotification(productName) {
  await pusher.trigger("shop-channel", "new-sale", {
    message: `কেউ একজন এইমাত্র ${productName} কিনলেন!`,
  });
}

