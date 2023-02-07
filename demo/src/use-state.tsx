import { render, useState, h, useEffect } from '../../src/index'

function App() {
  const [list, setList] = useState([1, 2, 3])
  return (
    <div>
      <Children />
      {list.map((d) => (
        <span>{d}</span>
      ))}{' '}
      <button onClick={() => setList(list.concat(4))}>+</button>
    </div>
  )
}

function Children() {
  const [num, setNum] = useState(0);

  return (
    <div onClick={() => setNum(num + 1)}>
      <div>
        this is a child component
      </div>
      <span>
        get number: { num }
      </span>
    </div>
  )
}

render(<App />, document.getElementById('app'))
