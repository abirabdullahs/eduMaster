/**
 * Rehype plugin to remove undefined/null nodes from children arrays.
 * Prevents "Cannot use 'in' operator to search for 'children' in undefined" from rehype-katex.
 */
function filterNode(node) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node.children)) {
    node.children = node.children.filter(Boolean)
    node.children.forEach(filterNode)
  }
}

export function rehypeFilterUndefined() {
  return (tree) => {
    if (!tree || typeof tree !== 'object') return tree
    filterNode(tree)
    return tree
  }
}
