export default (): Element => {
  const element = document.createElement('div')

  element.innerHTML = 'Hello, World!'

  return element
}
