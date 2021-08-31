import Layout from ':/layout/index'

export default [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('::/home')
      }
    ]
  },
  {
    path: '/login:',
    component: () => import('::/login')
  }
]
