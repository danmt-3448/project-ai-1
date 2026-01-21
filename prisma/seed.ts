import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (optional, for dev only)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.adminUser.deleteMany()

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  })
  console.log('✅ Created admin user:', admin.username)

  // Create categories
  const categoryAo = await prisma.category.create({
    data: {
      name: 'Áo',
      slug: 'ao',
    },
  })

  const categoryQuan = await prisma.category.create({
    data: {
      name: 'Quần',
      slug: 'quan',
    },
  })

  const categoryPhuKien = await prisma.category.create({
    data: {
      name: 'Phụ kiện',
      slug: 'phu-kien',
    },
  })

  console.log('✅ Created categories:', [categoryAo.name, categoryQuan.name, categoryPhuKien.name].join(', '))

  // Create products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Áo thun trắng',
        slug: 'ao-thun-trang',
        description: 'Áo thun cotton 100% cao cấp, thoáng mát, dễ phối đồ',
        price: 150000,
        inventory: 10,
        published: true,
        categoryId: categoryAo.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop']),
      },
      {
        name: 'Áo sơ mi xanh',
        slug: 'ao-so-mi-xanh',
        description: 'Áo sơ mi nam công sở, chất liệu kate mềm mại',
        price: 250000,
        inventory: 8,
        published: true,
        categoryId: categoryAo.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop']),
      },
      {
        name: 'Áo polo đen',
        slug: 'ao-polo-den',
        description: 'Áo polo thể thao, chất liệu thấm hút mồ hôi tốt',
        price: 180000,
        inventory: 15,
        published: true,
        categoryId: categoryAo.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1602810320073-1230c46d89d4?w=600&h=600&fit=crop']),
      },
      {
        name: 'Quần jean xanh',
        slug: 'quan-jean-xanh',
        description: 'Quần jean nam form slim fit, co giãn nhẹ',
        price: 350000,
        inventory: 5,
        published: true,
        categoryId: categoryQuan.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop']),
      },
      {
        name: 'Quần kaki nâu',
        slug: 'quan-kaki-nau',
        description: 'Quần kaki nam công sở, màu nâu đất thanh lịch',
        price: 280000,
        inventory: 12,
        published: true,
        categoryId: categoryQuan.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop']),
      },
      {
        name: 'Quần short đen',
        slug: 'quan-short-den',
        description: 'Quần short thể thao, thoáng mát cho mùa hè',
        price: 150000,
        inventory: 20,
        published: true,
        categoryId: categoryQuan.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop']),
      },
      {
        name: 'Thắt lưng da',
        slug: 'that-lung-da',
        description: 'Thắt lưng da bò cao cấp, khóa kim loại',
        price: 120000,
        inventory: 25,
        published: true,
        categoryId: categoryPhuKien.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=600&h=600&fit=crop']),
      },
      {
        name: 'Mũ lưỡi trai',
        slug: 'mu-luoi-trai',
        description: 'Mũ lưỡi trai thể thao, chống nắng hiệu quả',
        price: 80000,
        inventory: 30,
        published: true,
        categoryId: categoryPhuKien.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop']),
      },
      {
        name: 'Áo khoác gió',
        slug: 'ao-khoac-gio',
        description: 'Áo khoác gió 2 lớp, chống thấm nước',
        price: 450000,
        inventory: 3,
        published: false, // Unpublished for testing
        categoryId: categoryAo.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop']),
      },
      {
        name: 'Túi đeo chéo',
        slug: 'tui-deo-cheo',
        description: 'Túi đeo chéo nam, nhiều ngăn tiện dụng',
        price: 200000,
        inventory: 0, // Out of stock for testing
        published: true,
        categoryId: categoryPhuKien.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop']),
      },
    ],
  })

  console.log('✅ Created products:', products.count)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
