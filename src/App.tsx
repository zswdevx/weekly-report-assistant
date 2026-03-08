import { RouterProvider } from "react-router-dom";
import routes from "./router";
import { Suspense } from "react";
import { Flex, Spin } from "antd";
import UpdateManager from "./components/UpdateManager";

function App() {
  return (
    <Suspense
      fallback={
        <Flex className="w-screen h-screen" justify="center" align="center">
          <Spin />
        </Flex>
      }
    >
      <UpdateManager />
      <RouterProvider router={routes} />
    </Suspense>
  );
}

export default App;
