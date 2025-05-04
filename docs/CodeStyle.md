# React 风格指南
这个文档来自[https://jdf2e.github.io/jdc_fe_guide/docs/react/code](https://jdf2e.github.io/jdc_fe_guide/docs/react/code)
**给ai看和给自己看一样重要**
这个指南大部分基于现在在 JavaScript 中流行的标准，尽管有些约定（如：async/await 或 class 的 static 字段）根据具体情况也会被引入或者被禁止。当前这个指南不包括也不推荐任何 ECMAScript stage-3（第三阶段提案）之前的内容。

## 基本规则

- 每个文件只包含一个 React 组件
  - 然而，在一个文件里包含多个没有 state 或纯组件是允许的。 eslint: react/no-multi-comp
- 经常用 JSX 语法
- 不要用 `React.createElement`，除非你从一个非 JSX 文件中初始化 app

## Class vs React.createClass vs stateless vs hook

### 使用 Class 组件
如果你要用 state refs，最好用 `class extends React.Component` 而不是 `React.createClass`。 eslint: react/prefer-es6-class react/prefer-stateless-function

```tsx
// bad
const Listing = React.createClass({
  // ...
  render() {
    return <div>{this.state.hello}</div>;
  }
});

// good
class Listing extends React.Component {
  // ...
  render() {
    return <div>{this.state.hello}</div>;
  }
}
```

### 使用函数组件
如果你没有使用 state、refs，最好用正常函数（不是箭头函数）而不是 class：

```tsx
// bad
class Listing extends React.Component {
  render() {
    return <div>{this.props.hello}</div>;
  }
}

// bad (不鼓励依赖函数名推断)
const Listing = ({ hello }) => (
  <div>{hello}</div>
);

// good
function Listing({ hello }) {
  return <div>{hello}</div>;
}
```

## 命名规范

### 文件命名
- 扩展名：用 `.tsx` 作为组件扩展名
- 文件名：用大驼峰作为文件名，如：`ReservationCard.tsx`

### 组件命名
- 参数命名：React 组件用大驼峰，组件的实例用小驼峰。 eslint: react/jsx-pascal-case

```tsx
// bad
import reservationCard from './ReservationCard';

// good
import ReservationCard from './ReservationCard';

// bad
const ReservationItem = <ReservationCard />;

// good
const reservationItem = <ReservationCard />;
```

### 组件文件组织
- 组件命名：文件名作为组件名
- 对于文件夹里的根组件，应该用 `index.jsx` 作为文件名，同时用文件夹名作为组件名

```tsx
// bad
import Footer from './Footer/Footer';

// bad
import Footer from './Footer/index';

// good
import Footer from './Footer';
```

### 高阶组件（HOC）命名
用高阶组件名和传入的组件名组合作为生成的组件的 `displayName`。

```tsx
// bad
export default function withFoo(WrappedComponent) {
  return function WithFoo(props) {
    return <WrappedComponent {...props} foo />;
  }
}

// good
export default function withFoo(WrappedComponent) {
  function WithFoo(props) {
    return <WrappedComponent {...props} foo />;
  }

  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  WithFoo.displayName = `withFoo(${wrappedComponentName})`;
  return WithFoo;
}
```

### Props 命名
避免用 DOM 组件的属性名表达不同的意义

```tsx
// bad
<MyComponent style="fancy" />

// bad
<MyComponent className="fancy" />

// good
<MyComponent variant="fancy" />
```

## 声明

不要通过 `displayName` 命名组件。最好通过引用命名组件。

```tsx
// bad
export default React.createClass({
  displayName: 'ReservationCard',
  // stuff goes here
});

// good
export default class ReservationCard extends React.Component {
}
```

## 对齐

对 JSX 语法使用这些对齐风格。 eslint: react/jsx-closing-bracket-location react/jsx-closing-tag-location

```tsx
// bad
<Foo superLongParam="bar"
     anotherSuperLongParam="baz" />

// good
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
/>

// 如果能放在一行，也可以用单行表示
<Foo bar="bar" />

// Foo 里面的标签正常缩进
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
>
  <Quux />
</Foo>

// bad
{showButton &&
  <Button />
}

// bad
{
  showButton &&
    <Button />
}

// good
{showButton && (
  <Button />
)}

// good
{showButton && <Button />}
```

## 引用

在 JSX 属性中用双引号（"），但是在 js 里用单引号（'）。eslint: jsx-quotes

```tsx
// bad
<Foo bar='bar' />

// good
<Foo bar="bar" />

// bad
<Foo style={{ left: "20px" }} />

// good
<Foo style={{ left: '20px' }} />
```

## 间距

在自闭和标签内空一格。 eslint: no-multi-spaces, react/jsx-tag-spacing

```tsx
// bad
<Foo/>

// very bad
<Foo                 />

// bad
<Foo
 />

// good
<Foo />
```

JSX 里的大括号不要空格。 eslint: react/jsx-curly-spacing

```tsx
// bad
<Foo bar={ baz } />

// good
<Foo bar={baz} />
```

## 属性

### Props 命名
props 用小驼峰

```tsx
// bad
<Foo
  UserName="hello"
  phone_number={12345678}
/>

// good
<Foo
  userName="hello"
  phoneNumber={12345678}
/>
```

### 布尔值属性
如果 prop 的值是 true 可以忽略这个值，直接写 prop 名就可以。 eslint: react/jsx-boolean-value

```tsx
// bad
<Foo
  hidden={true}
/>

// good
<Foo
  hidden
/>

// good
<Foo hidden />
```

### 图片属性
`<img>` 标签通常会设置 alt 属性。如果图片是表现型的，alt 可以是空字符串或者 `<img>` 必须有 `role="presentation"` 这个属性。 eslint: jsx-a11y/alt-text

```tsx
// bad
<img src="hello.jpg" />

// good
<img src="hello.jpg" alt="Me waving hello" />

// good
<img src="hello.jpg" alt="" />

// good
<img src="hello.jpg" role="presentation" />
```

不要在 `<img>` 的 alt 属性里用类似 "image"，"photo"，"picture" 这些单词。 eslint: jsx-a11y/img-redundant-alt

```tsx
// bad
<img src="hello.jpg" alt="Picture of me waving hello" />

// good
<img src="hello.jpg" alt="Me waving hello" />
```

### ARIA 属性
只用可用的，不抽象的 ARIA roles。 eslint: jsx-a11y/aria-role

```tsx
// bad - 不是一个 ARIA role
<div role="datepicker" />

// bad - 抽象的 ARIA role
<div role="range" />

// good
<div role="button" />
```

不要在元素上用 accessKey。 eslint: jsx-a11y/no-access-key

```tsx
// bad
<div accessKey="h" />

// good
<div />
```

### Key 属性
避免用数组下标作为 key 属性，推荐用稳定的 ID

```tsx
// bad
{todos.map((todo, index) =>
  <Todo
    {...todo}
    key={index}
  />
)}

// good
{todos.map(todo => (
  <Todo
    {...todo}
    key={todo.id}
  />
))}
```

### 默认属性
对于所有非必须属性，定义一个明确的默认值。

```tsx
// bad
function SFC({ foo, bar, children }) {
  return <div>{foo}{bar}{children}</div>;
}
SFC.propTypes = {
  foo: PropTypes.number.isRequired,
  bar: PropTypes.string,
  children: PropTypes.node,
};

// good
function SFC({ foo, bar, children }) {
  return <div>{foo}{bar}{children}</div>;
}
SFC.propTypes = {
  foo: PropTypes.number.isRequired,
  bar: PropTypes.string,
  children: PropTypes.node,
};
SFC.defaultProps = {
  bar: '',
  children: null,
};
```

### Props 扩展运算符
少用 props 扩展运算符，既 `{...props}`

```tsx
// bad
render() {
  const { irrelevantProp, ...relevantProps  } = this.props;
  return <WrappedComponent {...this.props} />
}

// good
render() {
  const { irrelevantProp, ...relevantProps  } = this.props;
  return <WrappedComponent {...relevantProps} />
}
```

## Refs

推荐用 ref callback 函数。 eslint: react/no-string-refs

```tsx
// bad
<Foo
  ref="myRef"
/>

// good
<Foo
  ref={(ref) => { this.myRef = ref; }}
/>
```

## 圆括号

当 JSX 标签有多行时，用圆括号包起来。eslint: react/jsx-wrap-multilines

```tsx
// bad
render() {
  return <MyComponent variant="long body" foo="bar">
           <MyChild />
         </MyComponent>;
}

// good
render() {
  return (
    <MyComponent variant="long body" foo="bar">
      <MyChild />
    </MyComponent>
  );
}

// good, 单行可以直接写
render() {
  const body = <div>hello</div>;
  return <MyComponent>{body}</MyComponent>;
}
```

## 标签

当没有子元素时，最好用自闭合标签。 eslint: react/self-closing-comp

```tsx
// bad
<Foo variant="stuff"></Foo>

// good
<Foo variant="stuff" />
```

如果你的组件有多行属性，用他的闭合标签单独作为结束行。 eslint: react/jsx-closing-bracket-location

```tsx
// bad
<Foo
  bar="bar"
  baz="baz" />

// good
<Foo
  bar="bar"
  baz="baz"
/>
```

## 方法

### 事件处理
用箭头函数关闭局部变量。

```tsx
function ItemList(props) {
  return (
    <ul>
      {props.items.map((item, index) => (
        <Item
          key={item.key}
          onClick={() => doSomethingWith(item.name, index)}
        />
      ))}
    </ul>
  );
}
```

在构造函数里绑定事件处理函数。 eslint: react/jsx-no-bind

```tsx
// bad
class extends React.Component {
  onClickDiv() {
    // do stuff
  }

  render() {
    return <div onClick={this.onClickDiv.bind(this)} />;
  }
}

// good
class extends React.Component {
  constructor(props) {
    super(props);

    this.onClickDiv = this.onClickDiv.bind(this);
  }

  onClickDiv() {
    // do stuff
  }

  render() {
    return <div onClick={this.onClickDiv} />;
  }
}
```

### 方法命名
不要在 React 组件里使用下划线作为内部方法名前缀。

```tsx
// bad
React.createClass({
  _onClickSubmit() {
    // do stuff
  },

  // other stuff
});

// good
class extends React.Component {
  onClickSubmit() {
    // do stuff
  }

  // other stuff
}
```

### Render 方法
确保你的 render 函数有返回值。 eslint: react/require-render-return

```tsx
// bad
render() {
  (<div />);
}

// good
render() {
  return (<div />);
}
```

## 属性排序

### Class 组件内部属性顺序
1. 可选的 static 方法
2. constructor
3. getChildContext
4. componentWillMount
5. componentDidMount
6. componentWillReceiveProps
7. shouldComponentUpdate
8. componentWillUpdate
9. componentDidUpdate
10. componentWillUnmount
11. clickHandlers or eventHandlers 如：onClickSubmit()、onChangeDescription()
12. getter methods for render 如：getSelectReason()、getFooterContent()
13. optional render methods 如：renderNavigation()、renderProfilePicture()
14. render

```tsx
import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  text: PropTypes.string,
};

const defaultProps = {
  text: 'Hello World',
};

class Link extends React.Component {
  static methodsAreOk() {
    return true;
  }

  render() {
    return <a href={this.props.url} data-id={this.props.id}>{this.props.text}</a>;
  }
}

Link.propTypes = propTypes;
Link.defaultProps = defaultProps;

export default Link;
```

### React.createClass 内部属性排序
1. displayName
2. propTypes
3. contextTypes
4. childContextTypes
5. mixins
6. statics
7. defaultProps
8. getDefaultProps
9. getInitialState
10. getChildContext
11. componentWillMount
12. componentDidMount
13. componentWillReceiveProps
14. shouldComponentUpdate
15. componentWillUpdate
16. componentDidUpdate
17. componentWillUnmount
18. clickHandlers or eventHandlers 如：onClickSubmit()、onChangeDescription()
19. getter methods for render 如：getSelectReason()、getFooterContent()
20. optional render methods 如：renderNavigation()、renderProfilePicture()
21. render

## isMounted

不要用 isMounted。 eslint: react/no-is-mounted