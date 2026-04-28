import React from 'react'
import BalanceList from './balanceList'

const BalanceLists = ({ list, btn = false }) => {
  function createTree(list) {
    let map = {},
      node,
      roots = [],
      i

    for (i = 0; i < list.length; i += 1) {
      map[list[i].number] = i // initialize the map
      list[i].child = [] // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i]
      if (node.parent !== '0') {
        // if you have dangling branches check that map[node.parent] exists
        list[map[node.parent]].child.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }
  const coaTree = createTree(list)
  return coaTree.map((d) => <BalanceList key={d.number} list={d} btn={btn} />)
}

export default BalanceLists
