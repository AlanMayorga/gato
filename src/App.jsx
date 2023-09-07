import { useRef, useState } from 'react'
import confetti from 'canvas-confetti'

const TURNS = {
  x: 'X',
  o: 'O'
}

const WINNER_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

const checkWinner = (boardToCheck) => {
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    if (
      boardToCheck[a] &&
      boardToCheck[a] === boardToCheck[b] &&
      boardToCheck[a] === boardToCheck[c]
    ) {
      return boardToCheck[a]
    }
  }
  return null
}

const saveGame = ({ board, turn }) => {
  window.localStorage.setItem('board', JSON.stringify(board))
  window.localStorage.setItem('turn', turn)
}

const resetGameStorage = () => {
  window.localStorage.removeItem('board')
  window.localStorage.removeItem('turn')
}

function Cell ({ children, index, isTurn, updateBoard = () => { } }) {
  const className = `cell ${isTurn ? 'is-turn' : ''}`

  const handleClick = () => {
    updateBoard(index)
  }

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  )
}

function App () {
  const [turn, setTurn] = useState(() => {
    const turnStorage = window.localStorage.getItem('turn')
    return turnStorage ?? TURNS.x
  })
  const [board, setBoard] = useState(() => {
    const boardStorage = window.localStorage.getItem('board')
    if (boardStorage) return JSON.parse(boardStorage)
    return Array(9).fill(null)
  })
  const [winner, setWinner] = useState(null)

  const modal = useRef(null)

  const updateBoard = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.x ? TURNS.o : TURNS.x
    setTurn(newTurn)

    saveGame({
      board: newBoard,
      turn: newTurn
    })

    const newWinner = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
      confetti()
      modal.current.showModal()
    } else if (!newBoard.includes(null)) {
      setWinner(false)
      modal.current.showModal()
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(TURNS.x)
    setWinner(null)

    resetGameStorage()

    modal.current.close()
  }

  return (
    <main>
      <h1>Gato #</h1>
      <section className='board'>
        {
          board.map((val, i) => (
            <Cell key={i} index={i} updateBoard={updateBoard}>
              {val}
            </Cell>
          ))
        }
      </section>
      <section className='turn'>
        <Cell isTurn={turn === TURNS.x}>
          {TURNS.x}
        </Cell>
        <Cell isTurn={turn === TURNS.o}>
          {TURNS.o}
        </Cell>
      </section>
      <footer>
        <button onClick={resetGame}>Reiniciar juego</button>
      </footer>
      <dialog ref={modal}>
        <section>
          <header>
            <h2>{winner ? 'Gano:' : 'Empate'}</h2>
          </header>
          <Cell>{winner === false ? '.' : winner}</Cell>
          <footer>
            <button onClick={resetGame}>Empezar de nuevo</button>
          </footer>
        </section>
      </dialog>
    </main>
  )
}

export default App
