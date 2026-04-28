import { describe, it, expect } from 'vitest'
import createTree from '../components/custom/createTree'

describe('createTree', () => {
  it('returns an empty array for an empty list', () => {
    expect(createTree([])).toEqual([])
  })

  it('returns a single root node with no children', () => {
    const list = [{ number: '1', name: 'Root', parent: '0' }]
    const result = createTree(list)
    expect(result).toHaveLength(1)
    expect(result[0].number).toBe('1')
    expect(result[0].child).toEqual([])
  })

  it('nests a child under its parent', () => {
    const list = [
      { number: '1', name: 'Root', parent: '0' },
      { number: '2', name: 'Child', parent: '1' },
    ]
    const result = createTree(list)
    expect(result).toHaveLength(1)
    expect(result[0].child).toHaveLength(1)
    expect(result[0].child[0].number).toBe('2')
  })

  it('supports multiple root nodes', () => {
    const list = [
      { number: '1', name: 'Root A', parent: '0' },
      { number: '2', name: 'Root B', parent: '0' },
    ]
    const result = createTree(list)
    expect(result).toHaveLength(2)
  })

  it('builds a multi-level tree', () => {
    const list = [
      { number: '1', name: 'Root',        parent: '0' },
      { number: '2', name: 'Child',       parent: '1' },
      { number: '3', name: 'Grandchild',  parent: '2' },
    ]
    const result = createTree(list)
    expect(result[0].child[0].child[0].number).toBe('3')
  })

  it('attaches multiple children to the same parent', () => {
    const list = [
      { number: '1', name: 'Root',    parent: '0' },
      { number: '2', name: 'Child A', parent: '1' },
      { number: '3', name: 'Child B', parent: '1' },
    ]
    const result = createTree(list)
    expect(result[0].child).toHaveLength(2)
  })
})
