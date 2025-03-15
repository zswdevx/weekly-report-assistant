import { RouterProvider } from "react-router-dom";
import routes from "./router";
import { Suspense } from "react";
import { Flex, Spin } from "antd";

function App() {
  return (
    <Suspense
      fallback={
        <Flex className="w-screen h-screen" justify="center" align="center">
          <Spin />
        </Flex>
      }
    >
      <RouterProvider router={routes} />
    </Suspense>
  );
}

export default App;
