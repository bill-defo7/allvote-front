import { useAuth } from '../../context/AuthContext'
import Tableau from './Tableau'
import AdminTableau from './admin/AdminTableau'

/** /espace : tableau de bord adapté au rôle. */
export default function Accueil() {
  const { estSuperAdmin } = useAuth()
  return estSuperAdmin ? <AdminTableau /> : <Tableau />
}
