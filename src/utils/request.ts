import { invoke, InvokeArgs, InvokeOptions } from "@tauri-apps/api/core";
import { message } from "antd";

export default async function <T extends Base<any>>(cmd: string, args?: InvokeArgs, options?: InvokeOptions) {
  const res = await invoke<T>(cmd, args, options);
  if (!res.success) {
    message.error(res.message);
  }
  return res;
}
