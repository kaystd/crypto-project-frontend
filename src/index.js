import App from './App'

let element = App()
document.body.appendChild(element)

module.hot && module.hot.accept('./App', () => {
  document.body.removeChild(element)
  element = App()
  document.body.appendChild(element)
})
