import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cartStore'

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [] })
  })

  it('should add item to cart', () => {
    const { addItem } = useCartStore.getState()

    addItem({
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 10,
    })

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      productId: 1,
      name: 'Test Product',
      quantity: 1,
      price: 100000,
    })
  })

  it('should increase quantity when adding existing item', () => {
    const { addItem } = useCartStore.getState()

    const product = {
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 10,
    }

    addItem(product)
    addItem(product, 2)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('should not exceed inventory when adding items', () => {
    const { addItem } = useCartStore.getState()

    const product = {
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 5,
    }

    addItem(product, 10) // Try to add 10 but inventory is only 5

    const { items } = useCartStore.getState()
    expect(items[0].quantity).toBe(5) // Should be capped at inventory
  })

  it('should remove item from cart', () => {
    const { addItem, removeItem } = useCartStore.getState()

    addItem({
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 10,
    })

    removeItem(1)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })

  it('should update item quantity', () => {
    const { addItem, updateQuantity } = useCartStore.getState()

    addItem({
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 10,
    })

    updateQuantity(1, 5)

    const { items } = useCartStore.getState()
    expect(items[0].quantity).toBe(5)
  })

  it('should remove item when quantity is set to 0', () => {
    const { addItem, updateQuantity } = useCartStore.getState()

    addItem({
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 10,
    })

    updateQuantity(1, 0)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })

  it('should calculate total items correctly', () => {
    const { addItem, getTotalItems } = useCartStore.getState()

    addItem(
      {
        productId: 1,
        name: 'Product 1',
        slug: 'product-1',
        price: 100000,
        inventory: 10,
      },
      2
    )

    addItem(
      {
        productId: 2,
        name: 'Product 2',
        slug: 'product-2',
        price: 200000,
        inventory: 10,
      },
      3
    )

    expect(getTotalItems()).toBe(5) // 2 + 3
  })

  it('should calculate subtotal correctly', () => {
    const { addItem, getSubtotal } = useCartStore.getState()

    addItem(
      {
        productId: 1,
        name: 'Product 1',
        slug: 'product-1',
        price: 100000,
        inventory: 10,
      },
      2
    )

    addItem(
      {
        productId: 2,
        name: 'Product 2',
        slug: 'product-2',
        price: 200000,
        inventory: 10,
      },
      3
    )

    expect(getSubtotal()).toBe(800000) // (100000 * 2) + (200000 * 3)
  })

  it('should clear cart', () => {
    const { addItem, clearCart } = useCartStore.getState()

    addItem({
      productId: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 100000,
      inventory: 10,
    })

    addItem({
      productId: 2,
      name: 'Test Product 2',
      slug: 'test-product-2',
      price: 200000,
      inventory: 10,
    })

    clearCart()

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })
})
