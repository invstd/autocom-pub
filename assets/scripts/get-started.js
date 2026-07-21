/**
 * Get started (install / account creation) flow: 3-step wizard with mocked delays.
 * Steps: Create account -> Verify phone (multi sub-state) -> Verify identity (multi sub-state).
 * No dedicated system-check step — connectivity-check.js handles that quietly in the background.
 */
(function () {
  var root = document.getElementById('get-started-card');
  if (!root) return;

  var stepper = document.querySelector('.get-started-page .steps-compact .steps');

  function syncStepper(index) {
    if (!stepper) return;
    stepper.querySelectorAll('.step').forEach(function (li) {
      var i = parseInt(li.getAttribute('data-step-index'), 10);
      li.classList.remove('step-success', 'step-primary', 'step-neutral');
      if (i < index) {
        li.classList.add('step-success');
        li.setAttribute('data-content', '✓');
      } else if (i === index) {
        li.classList.add('step-primary');
        li.setAttribute('data-content', String(i));
      } else {
        li.classList.add('step-neutral');
        li.setAttribute('data-content', String(i));
      }
    });
  }

  function showStep(index) {
    root.querySelectorAll('.get-started-step').forEach(function (el) {
      el.classList.toggle('hidden', parseInt(el.getAttribute('data-step'), 10) !== index);
    });
    syncStepper(index);
  }

  function showSubstep(stepEl, id) {
    stepEl.querySelectorAll('.get-started-substep').forEach(function (el) {
      el.classList.toggle('hidden', el.id !== id);
    });
  }

  // Camera-shutter flash + brief "captured" checkmark on a scan preview box, then callback.
  function simulateCapture(boxIdPrefix, btn, callback) {
    var flash = document.getElementById(boxIdPrefix + '-box').querySelector('.scan-flash');
    var defaultIcon = document.getElementById(boxIdPrefix + '-icon-default');
    var capturedIcon = document.getElementById(boxIdPrefix + '-icon-captured');
    btn.disabled = true;
    flash.classList.add('scan-flash-active');
    setTimeout(function () {
      defaultIcon.classList.add('hidden');
      capturedIcon.classList.remove('hidden');
    }, 120);
    setTimeout(function () {
      flash.classList.remove('scan-flash-active');
      defaultIcon.classList.remove('hidden');
      capturedIcon.classList.add('hidden');
      btn.disabled = false;
      callback();
    }, 550);
  }

  function enableWhenFilled(input, button) {
    input.addEventListener('input', function () {
      button.disabled = input.value.trim().length === 0;
    });
  }

  // ----- Step 1: Create account (multi sub-state: details -> verify email -> company) -----
  (function () {
    var stepEl = document.getElementById('step-account');

    // -- account-details --
    var email = document.getElementById('account-email');
    var password = document.getElementById('account-password');
    var firstName = document.getElementById('account-first-name');
    var lastName = document.getElementById('account-last-name');
    var phone = document.getElementById('account-phone');
    var detailsNext = document.getElementById('account-details-next');

    function updateDetailsState() {
      var filled = [email, password, firstName, lastName, phone].every(function (input) {
        return input.value.trim().length > 0;
      });
      detailsNext.disabled = !filled;
    }
    [email, password, firstName, lastName, phone].forEach(function (input) {
      input.addEventListener('input', updateDetailsState);
    });

    detailsNext.addEventListener('click', function () {
      document.getElementById('account-email-display').textContent = email.value.trim();
      detailsNext.disabled = true;
      var label = detailsNext.textContent;
      detailsNext.textContent = 'Creating account…';
      setTimeout(function () {
        detailsNext.textContent = label;
        showSubstep(stepEl, 'account-verify-email');
      }, 700);
    });

    // -- account-verify-email --
    var emailCodeInput = document.getElementById('account-email-code-input');
    var termsCheckbox = document.getElementById('account-terms-checkbox');
    var verifyContinue = document.getElementById('account-verify-email-continue');
    var verifyResend = document.getElementById('account-verify-email-resend');

    function updateVerifyState() {
      verifyContinue.disabled = !(emailCodeInput.value.trim().length > 0 && termsCheckbox.checked);
    }
    emailCodeInput.addEventListener('input', updateVerifyState);
    termsCheckbox.addEventListener('change', updateVerifyState);

    verifyResend.addEventListener('click', function () {
      verifyResend.disabled = true;
      verifyResend.textContent = 'Code resent';
      setTimeout(function () {
        verifyResend.disabled = false;
        verifyResend.textContent = 'Resend code';
      }, 1500);
    });

    verifyContinue.addEventListener('click', function () {
      showSubstep(stepEl, 'account-company');
    });

    // -- account-company --
    var vatInput = document.getElementById('company-vat');
    var fetchBtn = document.getElementById('company-fetch-btn');
    var companyFields = ['company-name', 'company-address1', 'company-address2', 'company-postal', 'company-city', 'company-region'].map(function (id) {
      return document.getElementById(id);
    });
    var countrySelect = document.getElementById('company-country');
    var requiredCompanyFields = [document.getElementById('company-name'), document.getElementById('company-address1'), document.getElementById('company-postal'), document.getElementById('company-city')];
    var createAccountBtn = document.getElementById('account-continue');

    enableWhenFilled(vatInput, fetchBtn);

    function updateCreateAccountState() {
      var filled = vatInput.value.trim().length > 0 && countrySelect.value !== '' && requiredCompanyFields.every(function (input) {
        return input.value.trim().length > 0;
      });
      createAccountBtn.disabled = !filled;
    }
    requiredCompanyFields.concat([countrySelect]).forEach(function (el) {
      el.addEventListener('input', updateCreateAccountState);
      el.addEventListener('change', updateCreateAccountState);
    });

    // Mocks a business-registry lookup (e.g. Bolagsverket) by VAT/org number: the real portal
    // keeps company fields disabled until this lookup pre-fills them, then leaves them editable.
    fetchBtn.addEventListener('click', function () {
      fetchBtn.disabled = true;
      var label = fetchBtn.textContent;
      fetchBtn.textContent = 'Fetching…';
      setTimeout(function () {
        fetchBtn.textContent = label;
        fetchBtn.disabled = false;
        document.getElementById('company-name').value = 'Nordic Auto Service AB';
        document.getElementById('company-address1').value = 'Verkstadsgatan 12';
        document.getElementById('company-postal').value = '412 50';
        document.getElementById('company-city').value = 'Göteborg';
        countrySelect.value = 'SE';
        companyFields.concat([countrySelect]).forEach(function (el) {
          el.disabled = false;
        });
        updateCreateAccountState();
      }, 800);
    });

    createAccountBtn.addEventListener('click', function () {
      createAccountBtn.disabled = true;
      var label = createAccountBtn.textContent;
      createAccountBtn.textContent = 'Creating account…';
      setTimeout(function () {
        createAccountBtn.textContent = label;
        showStep(2);
      }, 700);
    });
  })();

  // ----- Step 2: Verify phone (multi sub-state) -----
  (function () {
    var stepEl = document.getElementById('step-phone');
    var phoneInput = document.getElementById('phone-number');
    var phoneCountryCode = document.getElementById('phone-country-code');
    var sendCodeBtn = document.getElementById('phone-send-code-1');
    var phoneDisplay = document.getElementById('phone-number-display');
    var code1Input = document.getElementById('phone-code-1-input');
    var code1Continue = document.getElementById('phone-code-1-continue');
    var resendBtn = document.getElementById('phone-code-1-resend');
    var trustYes = document.getElementById('phone-trust-yes');
    var trustNo = document.getElementById('phone-trust-no');
    var code2Input = document.getElementById('phone-code-2-input');
    var code2Continue = document.getElementById('phone-code-2-continue');
    var code2Resend = document.getElementById('phone-code-2-resend');
    var code2Back = document.getElementById('phone-code-2-back');
    var code2Skip = document.getElementById('phone-code-2-skip');

    enableWhenFilled(phoneInput, sendCodeBtn);
    enableWhenFilled(code1Input, code1Continue);
    enableWhenFilled(code2Input, code2Continue);

    sendCodeBtn.addEventListener('click', function () {
      phoneDisplay.textContent = phoneCountryCode.value + ' ' + phoneInput.value.trim();
      sendCodeBtn.disabled = true;
      sendCodeBtn.textContent = 'Sending code…';
      setTimeout(function () {
        sendCodeBtn.textContent = 'Send code';
        showSubstep(stepEl, 'phone-code-1');
      }, 600);
    });

    resendBtn.addEventListener('click', function () {
      resendBtn.disabled = true;
      resendBtn.textContent = 'Code resent';
      setTimeout(function () {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend code';
      }, 1500);
    });

    code1Continue.addEventListener('click', function () {
      showSubstep(stepEl, 'phone-trust-device');
    });

    // Basic phone verification (phone-code-1) is already done by this point — Secure Gateway
    // activation (phone-code-2) is an additional, optional unlock, so declining trust here
    // skips it entirely instead of forcing the user through it anyway.
    function finishPhoneStep() {
      showSubstep(stepEl, 'phone-verified');
      setTimeout(function () { showStep(3); }, 900);
    }

    trustYes.addEventListener('click', function () {
      showSubstep(stepEl, 'phone-code-2');
    });
    trustNo.addEventListener('click', finishPhoneStep);

    code2Resend.addEventListener('click', function () {
      code2Resend.disabled = true;
      code2Resend.textContent = 'Code resent';
      setTimeout(function () {
        code2Resend.disabled = false;
        code2Resend.textContent = 'Resend code';
      }, 1500);
    });

    // Escape hatches for when the SMS never arrives: step back to reconsider trusting the
    // device at all, or skip Secure Gateway activation for now (same as declining trust).
    code2Back.addEventListener('click', function () {
      showSubstep(stepEl, 'phone-trust-device');
    });
    code2Skip.addEventListener('click', finishPhoneStep);

    code2Continue.addEventListener('click', finishPhoneStep);
  })();

  // ----- Step 3: Verify identity (mocked iDenfy-style) -----
  (function () {
    var stepEl = document.getElementById('step-identity');
    var startBtn = document.getElementById('identity-start');
    var scanFrontBtn = document.getElementById('identity-scan-front-btn');
    var scanBackBtn = document.getElementById('identity-scan-back-btn');
    var scanSelfieBtn = document.getElementById('identity-scan-selfie-btn');

    startBtn.addEventListener('click', function () {
      showSubstep(stepEl, 'identity-qr-handoff');
      // Mocks the real product's live desktop<->phone session handoff (see iDenfy's "Switch to
      // mobile" QR/SMS flow) — no actual second device, so this just auto-advances after a delay
      // long enough to actually read the screen (QR + session code + copy), not just flash by.
      setTimeout(function () {
        showSubstep(stepEl, 'identity-scan-front');
      }, 8000);
    });
    scanFrontBtn.addEventListener('click', function () {
      simulateCapture('identity-scan-front', scanFrontBtn, function () {
        showSubstep(stepEl, 'identity-scan-back');
      });
    });
    scanBackBtn.addEventListener('click', function () {
      simulateCapture('identity-scan-back', scanBackBtn, function () {
        showSubstep(stepEl, 'identity-scan-selfie');
      });
    });
    scanSelfieBtn.addEventListener('click', function () {
      simulateCapture('identity-scan-selfie', scanSelfieBtn, function () {
        showSubstep(stepEl, 'identity-verifying');
        setTimeout(function () {
          showSubstep(stepEl, 'identity-verified');
          setTimeout(function () {
            showSubstep(stepEl, 'get-started-complete');
            // Session-level (not device-level): lets welcome.njk skip straight to Quick Connect
            // next time this device opens the app, instead of showing Login/Create account again.
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('air-session-active', '1');
              // First-time-ever account setup just finished: land in onboarding mode on Quick
              // Connect instead of the manual dev toggle defaulting to normal/Recent Vehicles.
              localStorage.setItem('launchpad-onboarding-mode', 'onboarding');
            }
            if (stepper) {
              var lastStep = stepper.querySelector('.step[data-step-index="3"]');
              if (lastStep) {
                lastStep.classList.remove('step-primary');
                lastStep.classList.add('step-success');
                lastStep.setAttribute('data-content', '✓');
              }
            }
          }, 900);
        }, 1300);
      });
    });
  })();

  showStep(1);
})();
