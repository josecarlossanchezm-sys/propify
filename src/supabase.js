// src/supabase.js
// Conexión a tu base de datos Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

// Registrar nuevo usuario
export async function signUp({ email, password, name, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }
    }
  })
  return { data, error }
}

// Iniciar sesión
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Cerrar sesión
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Obtener usuario actual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Obtener perfil del usuario
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// ─── PROPIEDADES ──────────────────────────────────────────────────────────────

// Obtener todas las propiedades activas
export async function getProperties({ type, search, sortBy } = {}) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      profiles (id, name, avatar_url, agency, verified),
      property_images (url, is_main, order_index)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (type && type !== 'Todos') {
    query = query.eq('type', type)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`)
  }

  if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
  if (sortBy === 'price_desc') query = query.order('price', { ascending: false })

  const { data, error } = await query
  return { data, error }
}

// Obtener una propiedad por ID
export async function getPropertyById(id) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles (id, name, avatar_url, agency, title, bio, phone, email, verified),
      property_images (url, is_main, order_index)
    `)
    .eq('id', id)
    .single()

  // Incrementar vistas
  if (data) {
    await supabase
      .from('properties')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)
  }

  return { data, error }
}

// Crear nueva propiedad
export async function createProperty(propertyData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('properties')
    .insert([{ ...propertyData, agent_id: user.id }])
    .select()
    .single()

  return { data, error }
}

// Actualizar propiedad
export async function updateProperty(id, updates) {
  const { data, error } = await supabase
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// Mis propiedades (del agente logueado)
export async function getMyProperties() {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_images (url, is_main)`)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error }
}

// ─── IMÁGENES ────────────────────────────────────────────────────────────────

// Subir imagen de propiedad
export async function uploadPropertyImage(propertyId, file, index = 0) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${propertyId}/${Date.now()}_${index}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(fileName, file)

  if (uploadError) return { error: uploadError }

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName)

  const { data, error } = await supabase
    .from('property_images')
    .insert([{
      property_id: propertyId,
      url: publicUrl,
      is_main: index === 0,
      order_index: index
    }])

  return { data, error, url: publicUrl }
}

// ─── FAVORITOS ───────────────────────────────────────────────────────────────

// Obtener mis favoritos
export async function getFavorites() {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', user.id)

  return { data: data?.map(f => f.property_id) || [], error }
}

// Toggle favorito
export async function toggleFavorite(propertyId) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Inicia sesión para guardar favoritos' }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
    return { saved: false, error }
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: user.id, property_id: propertyId }])
    return { saved: true, error }
  }
}

// ─── LEADS ───────────────────────────────────────────────────────────────────

// Enviar mensaje / lead
export async function sendLead({ propertyId, agentId, senderName, senderEmail, senderPhone, message }) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      property_id: propertyId,
      agent_id: agentId,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: senderPhone,
      message,
      status: 'new'
    }])
  return { data, error }
}

// Obtener leads del agente
export async function getMyLeads() {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('leads')
    .select(`*, properties (title, type)`)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Marcar lead como leído
export async function markLeadRead(leadId) {
  const { error } = await supabase
    .from('leads')
    .update({ status: 'read' })
    .eq('id', leadId)
  return { error }
}
