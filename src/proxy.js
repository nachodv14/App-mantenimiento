import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Rutas API que requieren estar logueado
const protectedApiRoutes = ['/api/tareas', '/api/admin', '/api/machines', '/api/operarios', '/api/sync-sheets', '/api/data'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta protegida
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isProtectedPage = pathname.startsWith('/admin') || pathname.startsWith('/operario') || pathname.startsWith('/supervisor');

  if (!isProtectedApi && !isProtectedPage) {
    return NextResponse.next();
  }

  // Leer la cookie
  const token = request.cookies.get('mantenimiento_token')?.value;

  // Si no hay token
  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'No autorizado - Inicie sesión' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Verificar token
  const payload = await verifyToken(token);
  if (!payload) {
    // Si la firma es inválida o expiró
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
    // Borrar la cookie expirada y mandar a inicio
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.delete('mantenimiento_token');
    return res;
  }

  // Protección de rutas por rol
  const role = payload.role;
  const isPageAdmin = pathname.startsWith('/admin');
  const isPageOperario = pathname.startsWith('/operario');
  const isPageSupervisor = pathname.startsWith('/supervisor');

  if (isProtectedPage) {
    if (role === 'admin' && !isPageAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (role === 'supervisor' && !isPageSupervisor) {
      return NextResponse.redirect(new URL('/supervisor', request.url));
    }
    if (role === 'operario' && !isPageOperario) {
      return NextResponse.redirect(new URL('/operario', request.url));
    }
  }

  // Protección para APIs exclusivas de admin
  const isApiAdmin = pathname.startsWith('/api/admin');
  if (isApiAdmin && role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado - Requiere permisos de administrador' }, { status: 403 });
  }

  // Si todo está bien, dejar pasar
  const response = NextResponse.next();
  // Pasamos datos útiles en los headers para que la API o página sepa quién llama
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-username', payload.username || '');
  response.headers.set('x-user-plant', payload.plant || '');

  return response;
}

export const config = {
  // Evitar que el middleware se ejecute en estáticos e imágenes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};
