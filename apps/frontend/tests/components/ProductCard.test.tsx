import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    description: 'This is a test product',
    price: 150000,
    inventory: 10,
    images: ['https://via.placeholder.com/400'],
    category: {
      id: 1,
      name: 'Test Category',
      slug: 'test-category',
    },
  }

  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText(/Test Product/)).toBeInTheDocument()
    expect(screen.getByText(/150.000 ₫/)).toBeInTheDocument()
    expect(screen.getByText(/Stock: 10/)).toBeInTheDocument()
  })

  it('should show "Out of Stock" when inventory is 0', () => {
    const outOfStockProduct = { ...mockProduct, inventory: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('should render category name', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('should have correct link to product detail page', () => {
    render(<ProductCard product={mockProduct} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/test-product')
  })
})
