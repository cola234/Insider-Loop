import { ref } from 'vue'

export function useDeckDrag(deck, deckBg, phase, isRunning, playTone) {
  const dragIndex = ref(-1)

  function onDragStart(index, event) {
    if (phase.value !== 'arrange' || isRunning.value) return
    dragIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    playTone('select')

    const dragImage = event.target.cloneNode(true)
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-9999px'
    dragImage.style.width = '120px'
    dragImage.style.height = 'auto'
    dragImage.style.opacity = '0.9'
    dragImage.style.transform = 'rotate(5deg) scale(1.1)'
    dragImage.style.filter = 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8))'
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 60, 40)

    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
  }

  function onDragOver(index, event) {
    if (phase.value !== 'arrange' || isRunning.value) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const target = event.currentTarget
    if (dragIndex.value !== index) {
      target.classList.add('drag-over')
      document.querySelectorAll('.deck-card.drag-over').forEach((el) => {
        if (el !== target) el.classList.remove('drag-over')
      })
    }
  }

  function onDrop(index, event) {
    if (phase.value !== 'arrange' || isRunning.value) return
    event.preventDefault()
    const from = dragIndex.value
    if (from < 0 || from === index) return

    event.currentTarget.classList.remove('drag-over')
    playTone('confirm')

    const updated = [...deck.value]
    const [moved] = updated.splice(from, 1)
    updated.splice(index, 0, moved)
    deck.value = updated

    const updatedBg = [...deckBg.value]
    const [movedBg] = updatedBg.splice(from, 1)
    updatedBg.splice(index, 0, movedBg)
    deckBg.value = updatedBg

    dragIndex.value = -1
  }

  function onDragEnd() {
    dragIndex.value = -1
    document.querySelectorAll('.deck-card.drag-over').forEach((el) => {
      el.classList.remove('drag-over')
    })
  }

  function onDragLeave(event) {
    event.currentTarget.classList.remove('drag-over')
  }

  function moveCard(index, direction) {
    if (phase.value !== 'arrange') return
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= deck.value.length) return
    const updated = [...deck.value]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    deck.value = updated

    const updatedBg = [...deckBg.value]
    ;[updatedBg[index], updatedBg[newIndex]] = [updatedBg[newIndex], updatedBg[index]]
    deckBg.value = updatedBg
  }

  return {
    dragIndex,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDragLeave,
    moveCard,
  }
}
