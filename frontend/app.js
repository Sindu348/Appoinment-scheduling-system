const $ = (selector) => document.querySelector(selector);

const state = {
  adminToken: sessionStorage.getItem('appointmentAdminToken') || '',
};

const dateInput = $('#appointment-date');
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

dateInput.min = today;

async function api(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.adminToken) {
    headers['x-admin-token'] = state.adminToken;
  }

  const response = await fetch(url, { ...options, headers });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed.');
  }

  return result;
}

// Escape database/user text before inserting it into HTML.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

async function loadServices() {
  const select = $('#service');

  try {
    const { data } = await api('/api/services');

    select.innerHTML = '<option value="">Select a service</option>';

    for (const service of data) {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent =
        `${service.name} · ${service.duration_minutes} min · $${(service.price_cents / 100).toFixed(2)}`;
      select.append(option);
    }
  } catch (error) {
    select.innerHTML = '<option value="">Services are unavailable</option>';
    showMessage($('#booking-message'), error.message, true);
  }
}

async function loadSlots() {
  const serviceId = $('#service').value;
  const date = dateInput.value;
  const slotsContainer = $('#slots');

  $('#start-time').value = '';

  if (!serviceId || !date) {
    slotsContainer.innerHTML =
      '<p class="helper-text">Choose a service and date to see available times.</p>';
    return;
  }

  slotsContainer.innerHTML = '<p class="helper-text">Checking available times…</p>';

  try {
    const params = new URLSearchParams({ serviceId, date });
    const { data } = await api(`/api/availability?${params}`);

    if (!data.length) {
      slotsContainer.innerHTML =
        '<p class="helper-text">No times are available. Try another date.</p>';
      return;
    }

    slotsContainer.replaceChildren();

    for (const slot of data) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot-button';
      button.textContent = slot.start_time.slice(0, 5);
      button.dataset.time = slot.start_time.slice(0, 5);

      button.addEventListener('click', () => {
        slotsContainer.querySelectorAll('.slot-button').forEach((item) => {
          item.classList.remove('selected');
        });

        button.classList.add('selected');
        $('#start-time').value = button.dataset.time;
      });

      slotsContainer.append(button);
    }
  } catch (error) {
    slotsContainer.innerHTML =
      `<p class="helper-text">${escapeHtml(error.message)}</p>`;
  }
}

$('#service').addEventListener('change', loadSlots);
dateInput.addEventListener('change', loadSlots);

$('#booking-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = $('#booking-message');
  const button = $('#book-button');

  if (!$('#start-time').value) {
    showMessage(message, 'Choose one of the available times first.', true);
    return;
  }

  button.disabled = true;
  button.textContent = 'Submitting…';
  showMessage(message, '');

  try {
    const { data } = await api('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        customerName: $('#customer-name').value,
        customerEmail: $('#customer-email').value,
        customerPhone: $('#customer-phone').value,
        serviceId: $('#service').value,
        date: dateInput.value,
        startTime: $('#start-time').value,
      }),
    });

    showMessage(message, `Appointment booked. Reference: ${data.id}`);
    event.target.reset();
    $('#start-time').value = '';
    $('#slots').innerHTML =
      '<p class="helper-text">Choose a service and date to see available times.</p>';
  } catch (error) {
    showMessage(message, error.message, true);

    if (error.message.toLowerCase().includes('slot')) {
      await loadSlots();
    }
  } finally {
    button.disabled = false;
    button.innerHTML = 'Request appointment <span>→</span>';
  }
});

$('#staff-toggle').addEventListener('click', () => {
  $('#staff-panel').hidden = false;
  $('#staff-panel').scrollIntoView({ behavior: 'smooth' });

  if (state.adminToken) {
    openStaffView();
  }
});

$('#staff-close').addEventListener('click', () => {
  $('#staff-panel').hidden = true;
});

$('#staff-login').addEventListener('click', async () => {
  state.adminToken = $('#admin-token').value;

  try {
    await openStaffView();
    sessionStorage.setItem('appointmentAdminToken', state.adminToken);
  } catch (error) {
    state.adminToken = '';
    showMessage($('#staff-message'), error.message, true);
  }
});

$('#refresh-staff').addEventListener('click', loadStaffAppointments);
$('#filter-date').addEventListener('change', loadStaffAppointments);
$('#filter-status').addEventListener('change', loadStaffAppointments);

async function openStaffView() {
  // This request verifies the token before showing staff information.
  await api('/api/staff/appointments');
  $('#staff-login-panel').hidden = true;
  $('#staff-content').hidden = false;

  await Promise.all([
    loadStaffAppointments(),
    loadAvailabilityRules(),
  ]);
}

async function loadStaffAppointments() {
  const params = new URLSearchParams();

  if ($('#filter-date').value) {
    params.set('date', $('#filter-date').value);
  }

  if ($('#filter-status').value) {
    params.set('status', $('#filter-status').value);
  }

  const list = $('#appointments-list');
  list.textContent = 'Loading appointments…';

  try {
    const { data } = await api(`/api/staff/appointments?${params}`);

    if (!data.length) {
      list.innerHTML = '<p class="helper-text">No appointments match these filters.</p>';
      return;
    }

    list.innerHTML = data.map((appointment) => `
      <article class="appointment-card">
        <strong>${escapeHtml(appointment.customer_name)} · ${escapeHtml(appointment.services?.name || 'Service')}</strong>
        <p>${escapeHtml(appointment.appointment_date)} at ${escapeHtml(appointment.start_time.slice(0, 5))}</p>
        <p>${escapeHtml(appointment.customer_email)} · ${escapeHtml(appointment.status)}</p>
        <div class="appointment-actions">
          ${appointment.status === 'pending'
            ? `<button class="small-button" data-id="${escapeHtml(appointment.id)}" data-status="confirmed">Confirm</button>`
            : ''}
          ${!['cancelled', 'completed'].includes(appointment.status)
            ? `<button class="small-button" data-id="${escapeHtml(appointment.id)}" data-status="cancelled">Cancel</button>`
            : ''}
        </div>
      </article>
    `).join('');

    list.querySelectorAll('[data-status]').forEach((button) => {
      button.addEventListener('click', () => changeAppointmentStatus(button));
    });
  } catch (error) {
    list.textContent = error.message;
  }
}

async function changeAppointmentStatus(button) {
  const { id, status } = button.dataset;

  if (status === 'cancelled' && !window.confirm('Cancel this appointment?')) {
    return;
  }

  try {
    await api(`/api/staff/appointments/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    await loadStaffAppointments();
  } catch (error) {
    window.alert(error.message);
  }
}

async function loadAvailabilityRules() {
  const container = $('#availability-list');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  try {
    const { data } = await api('/api/staff/availability-rules');

    container.innerHTML = data.map((rule) => `
      <label class="availability-rule">
        <span>${weekdays[rule.weekday]} · ${escapeHtml(rule.start_time.slice(0, 5))}–${escapeHtml(rule.end_time.slice(0, 5))}</span>
        <input type="checkbox" data-rule-id="${escapeHtml(rule.id)}" ${rule.active ? 'checked' : ''}>
      </label>
    `).join('');

    container.querySelectorAll('[data-rule-id]').forEach((checkbox) => {
      checkbox.addEventListener('change', async () => {
        const previousValue = !checkbox.checked;

        try {
          await api(
            `/api/staff/availability-rules/${encodeURIComponent(checkbox.dataset.ruleId)}`,
            {
              method: 'PUT',
              body: JSON.stringify({ active: checkbox.checked }),
            }
          );
        } catch (error) {
          checkbox.checked = previousValue;
          window.alert(error.message);
        }
      });
    });
  } catch (error) {
    container.textContent = error.message;
  }
}

loadServices();