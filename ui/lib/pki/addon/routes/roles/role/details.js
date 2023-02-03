import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RolesRoleDetailsRoute extends Route {
  @service store;
  @service secretMountPath;

  model() {
    const { role } = this.paramsFor('roles/role');
    return this.store.queryRecord('pki/role', {
      backend: this.secretMountPath.currentPath,
      id: role,
    });
  }

  setupController(controller, resolvedModel) {
    super.setupController(controller, resolvedModel);
    const { id } = resolvedModel;
    const backend = this.secretMountPath.currentPath || 'pki';
    controller.breadcrumbs = [
      { label: 'secrets', route: 'secrets', linkExternal: true },
      { label: backend, route: 'overview' },
      { label: 'roles', route: 'roles.index' },
      { label: id },
    ];
  }
}
