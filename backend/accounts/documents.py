from django.http import FileResponse, Http404
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_safe

from .models import User
from .permissions import HasAdminPermission

DOCUMENT_FIELDS = {
    'national_cards': 'national_card_image',
    'student_cards': 'student_card_image',
    'passports': 'passport_image',
    'commitments': 'commitment_form',
}


@require_safe
@never_cache
def profile_document(request, directory, name):
    user = request.user
    if not user.is_authenticated or user.status != 'active' or '/' in name or '\\' in name:
        raise Http404
    field = DOCUMENT_FIELDS[directory]
    stored_name = f'{directory}/{name}'
    accounts = User.objects.filter(**{field: stored_name})
    can_manage_users = HasAdminPermission('perm_users')().has_permission(request, None)
    if not can_manage_users:
        accounts = accounts.filter(pk=user.pk)
    owner = accounts.only(field).first()
    if owner is None:
        raise Http404
    try:
        response = FileResponse(getattr(owner, field).open('rb'), as_attachment=True)
    except FileNotFoundError as exc:
        raise Http404 from exc
    response['X-Content-Type-Options'] = 'nosniff'
    return response
