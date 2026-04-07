---
title: 'react-beautiful-dnd表格拖拽时行收缩'
time: '2023-12-19'
tags: ["React", "CSS"]
summary: '最近在使用react-beautiful-dnd开发表格拖拽排序时遇到了一个问题：在选中一行并开始拖拽时 ，行、或者说单元格的样式会发生变化，具体表现为整行宽度收缩。在搜索资料并翻阅文档后，找到了这个问题的解决方法'
---

最近在使用react-beautiful-dnd开发表格拖拽排序时遇到了一个问题：在选中一行并开始拖拽时 ，行、或者说单元格的样式会发生变化，具体表现为整行宽度收缩。在搜索资料并翻阅文档后，找到了这个问题的解决方法。

先看一下对一个标准表格的某行拖拽时会发生什么吧，可以看到被拖拽行收缩了起来，这实际上是因为列的宽度丢失了。
<Image src="https://chev.contrails.space:12650/images/2024/06/10/13276d3949a02fcdea4e3b978363bab3.png" alt="默认拖拽样式" width={400} height={400} />

在react-beautiful-dnd官方文档中提到了在表格中使用的方法：[Tables](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/patterns/tables.md)。其中提到可以使用两种策略对表格进行拖拽排序，分别是`Fixed layouts`和`Dimension locking`，接下来我分别介绍一下。

## Fixed layouts

相比于后者，`Fixed layouts`性能更好且更容易实现，但是只适用于表格列宽固定的情况，这种情况下，只需要为`<Draggable />`包裹的行设置`display: table`即可。

如果上述方法不生效，也可以直接为`<td>`元素设置一个固定宽度，比如这里将`<td>`元素的宽度设置为`120px`：
```jsx
<DragDropContext onDragEnd={this.onDragEnd}>
  <Droppable droppableId="droppable">
    {(provided, snapshot) => (
      <table
        ref={provided.innerRef}
        style={getListStyle(snapshot.isDraggingOver)}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Test</th>
          </tr>
        </thead>
        <tbody>
          {this.state.items.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided, snapshot) => (
                <tr
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style
                  )}
                >
                  <td style={{ width: "120px" }}>{item.content}</td>
                  <td style={{ width: "120px" }}>{item.test}</td>
                </tr>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </tbody>
      </table>
    )}
  </Droppable>
</DragDropContext>
```
当然这不是本文的重点，毕竟不是每个表格都可以固定列宽的，很多情况下列宽会根据单元格中的内容自适应，这种情况就只能使用下面的方法了。

## Dimension locking

前面提到这种方法适用于列宽根据内容自适应的情况，不仅如此，它同样适用于列宽固定的情况，而且更加具有健壮性，但是性能会比较差。使用这种方法时表格内容最好不要超过50行，就算不考虑性能，上百行内容的拖拽体验想必也不会很好。

这个方法的实现思路简单来说就是：在拖拽前记录被拖拽行每个单元格的原始宽度和高度，并在拖拽中将该行单元格宽高设置为记录值，拖拽结束后移除样式。
```jsx
import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

class LockedCell extends React.Component {
  ref;

  getSnapshotBeforeUpdate(prevProps) {
    if (!this.ref) {
      return null;
    }

    const isDragStarting =
      this.props.isDragOccurring && !prevProps.isDragOccurring;

    if (!isDragStarting) {
      return null;
    }

    const { width, height } = this.ref.getBoundingClientRect();

    const snapshot = {
      width,
      height,
    };

    return snapshot;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const ref = this.ref;
    if (!ref) {
      return;
    }

    if (snapshot) {
      if (ref.style.width === snapshot.width) {
        return;
      }
      ref.style.width = `${snapshot.width}px`;
      ref.style.height = `${snapshot.height}px`;
      return;
    }

    if (this.props.isDragOccurring) {
      return;
    }

    // inline styles not applied
    if (ref.style.width == null) {
      return;
    }

    // no snapshot and drag is finished - clear the inline styles
    ref.style.removeProperty("height");
    ref.style.removeProperty("width");
  }

  setRef = (ref) => {
    this.ref = ref;
  };

  render() {
    return (
      <td ref={this.setRef} style={{ boxSizing: "border-box" }}>
        {this.props.children}
      </td>
    );
  }
}

const App = () => {
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // 构造测试数据
  const getItems = (count) =>
    Array.from({ length: count }, (v, k) => k).map((k) => ({
      id: `item-${k}`,
      content: `Item ${k}`,
    }));
  useEffect(() => {
    setItems(getItems(3));
  }, []);

  const onDragEnd = (result) => {
    setIsDragging(false);
  };

  const onBeforeDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Two</th>
            <th>Three</th>
            <th>Four</th>
          </tr>
        </thead>

        <DragDropContext
          onDragEnd={onDragEnd}
          onBeforeDragStart={onBeforeDragStart} // DIMENSION LOCKING
        >
          <Droppable droppableId="droppable">
            {(provided) => (
              <tbody {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <LockedCell
                          isDragOccurring={isDragging}
                          snapshot={snapshot}
                        >
                          {item.content}
                        </LockedCell>
                        <LockedCell
                          isDragOccurring={isDragging}
                          snapshot={snapshot}
                        >
                          2
                        </LockedCell>
                        <LockedCell
                          isDragOccurring={isDragging}
                          snapshot={snapshot}
                        >
                          3
                        </LockedCell>
                        <LockedCell
                          isDragOccurring={isDragging}
                          snapshot={snapshot}
                        >
                          4
                        </LockedCell>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </DragDropContext>
      </table>
    </div>
  );
};

export default App;
```
可以看到拖拽容器的实现没有什么变化，关键点在于使用`<LockedCell>`替代了`<td>`，而`<LockedCell>`具体做了什么呢？

刚才已经大致描述过了，使用`onBeforeDragStart`检测拖拽状态的临界点，拖拽前记录好该行中所有单元格的宽高，拖拽中设置宽高为记录值，拖拽结束后清除样式。这也是本方法性能低的原因，需要频繁读取DOM元素的属性并渲染。

代码的实现可以在这里查看👉 [在线代码](https://codesandbox.io/p/sandbox/graggable-table-5rx478?layout=%257B%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522rootPanelGroup%2522%253A%257B%2522direction%2522%253A%2522horizontal%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522id%2522%253A%2522ROOT_LAYOUT%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522clq58j2c800063b5ufhcayw1m%2522%252C%2522sizes%2522%253A%255B100%252C0%255D%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522EDITOR%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522id%2522%253A%2522clq58j2c800023b5uv1s9nhpn%2522%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522SHELLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522id%2522%253A%2522clq58j2c800033b5umbqvdhse%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522DEVTOOLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522id%2522%253A%2522clq58j2c800053b5u1n9cnb7z%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%252C%2522sizes%2522%253A%255B50%252C50%255D%257D%252C%2522tabbedPanels%2522%253A%257B%2522clq58j2c800023b5uv1s9nhpn%2522%253A%257B%2522id%2522%253A%2522clq58j2c800023b5uv1s9nhpn%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clqdqasrf00023b5tiigrjd63%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A154%252C%2522startColumn%2522%253A11%252C%2522endLineNumber%2522%253A154%252C%2522endColumn%2522%253A11%257D%255D%252C%2522filepath%2522%253A%2522%252Fsrc%252FApp.js%2522%252C%2522state%2522%253A%2522IDLE%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clqdqasrf00023b5tiigrjd63%2522%257D%252C%2522clq58j2c800053b5u1n9cnb7z%2522%253A%257B%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clq58j2c800043b5uoc5ruvzh%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522UNASSIGNED_PORT%2522%252C%2522port%2522%253A0%252C%2522path%2522%253A%2522%252F%2522%257D%255D%252C%2522id%2522%253A%2522clq58j2c800053b5u1n9cnb7z%2522%252C%2522activeTabId%2522%253A%2522clq58j2c800043b5uoc5ruvzh%2522%257D%252C%2522clq58j2c800033b5umbqvdhse%2522%253A%257B%2522tabs%2522%253A%255B%255D%252C%2522id%2522%253A%2522clq58j2c800033b5umbqvdhse%2522%257D%257D%252C%2522showDevtools%2522%253Atrue%252C%2522showShells%2522%253Afalse%252C%2522showSidebar%2522%253Atrue%252C%2522sidebarPanelSize%2522%253A15%257D)，最后看一下效果吧，可以看到行拖拽过程中宽度不再收缩了：
<Image src="https://chev.contrails.space:12650/images/2024/06/10/d87a1ec5afb1ed3501eeeb9766f7c134.png" alt="Dimension locking" width={400} height={400} />


