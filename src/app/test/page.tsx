"use client";

import { ReactNode, useRef, useState } from "react";
import Draggable from "react-draggable";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";

const DraggableBox = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const updateXarrow = useXarrow();
  return (
    // @ts-expect-error
    <Draggable onDrag={updateXarrow} onStop={updateXarrow}>
      <div
        className="
          w-32 h-32 bg-blue-500  font-bold rounded-lg shadow-lg cursor-move select-none
          text-center text-white text-md p-2
        "
        id={id}
      >
        {children}
      </div>
    </Draggable>
  );
};

const Test = () => {
  return (
    <main>
      <Xwrapper>
        <DraggableBox id="kathmandu">
          <>
            <h1>Pokhara, Nepal</h1>
          </>
        </DraggableBox>

        <DraggableBox id="pokhara">
          <>
            <h1>Kathmandu, Nepal</h1>
          </>
        </DraggableBox>
        <Xarrow start="kathmandu" end="pokhara" />
      </Xwrapper>
    </main>
  );
};

export default Test;
