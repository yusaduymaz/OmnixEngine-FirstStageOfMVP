import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'
const projectDir = process.cwd()
loadEnvConfig(projectDir)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 10485760 // 10MB
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket "product-images" already exists. Updating it to be public...')
      const { error: updateError } = await supabase.storage.updateBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 10485760
      })
      if (updateError) {
        console.error("Failed to update bucket:", updateError)
      } else {
        console.log("Bucket updated to public successfully.")
      }
    } else {
      console.error("Failed to create bucket:", error)
    }
  } else {
    console.log("Bucket 'product-images' created successfully.", data)
  }
}

createBucket()
