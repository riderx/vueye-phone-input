import { defineComponent, h, PropType, Transition } from "vue";
import "./style.scss";
import countries from "./countries";
import asYoutType, {
  PhoneNumber,
  parsePhoneNumberFromString
} from "libphonenumber-js";

/*** interfaces */

interface Country {
  name: string;
  nativeName: string;
  callCode: number | null;
  code: string;
}

type IPhoneNumber = PhoneNumber;
/****** constants */
const dropdownClasses = [
  "vpi-absolute vpi-bg-white vpi-shadow-lg z-20 vpi-max-h-64 vpi-p-2  vpi-top-full vpi-mt-2 vpi-left-0 vpi-w-full vpi-overflow-y-auto"
];
const getFlag = (code?: string) =>
  code ? `https://flagcdn.com/${code.toLowerCase()}.svg` : "";

export default defineComponent({
  name: "vue3-phone-input",
  props: {
    modelValue: {
      type: Object as PropType<IPhoneNumber>
    },
    shape: {
      type: String as PropType<"rounded-none" | "rounded" | "rounded-full">,
      default: "rounded"
    },
    outlined: {
      type: Boolean,
      default: false
    },
    raised: {
      type: Boolean,
      default: false
    },
    status: {
      type: String as PropType<"success" | "error" | "">,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    }
  },
  emits: [
    "update:modelValue",
    "blur",
    "focus",
    "click-dropdown",
    "change-country"
  ],
  data() {
    return {
      countries,
      selectedCountry: {} as Country | undefined,
      showDropdown: false,
      focused: false
    };
  },
  watch: {
    status() {
      if (!this.outlined) {
        throw new Error(
          "The status works only when the outlined prop is provided !"
        );
      }
    },
    modelValue() {
      let num: any;
      if (this.modelValue?.number) {
        num = asYoutType(this.modelValue?.number.toString());
      } else if (
        this.modelValue?.nationalNumber &&
        this.modelValue.countryCallingCode
      ) {
        num = asYoutType(
          this.modelValue.countryCallingCode +
            this.modelValue?.nationalNumber.toString()
        );
      }
      this.selectedCountry = this.countries.find(country => {
        return num?.country === country.code;
      });
    }
  },
  computed: {
    wrapperClasses(): Array<string> {
      let borderColor = "vpi-border-gray-300";

      if (this.status === "success") {
        borderColor = "vpi-border-green-500";
      } else if (this.status === "error") {
        borderColor = "vpi-border-red-500";
      }

      const outline = this.outlined
        ? "vpi-border-2 " + borderColor
        : "vpi-bg-white";
      return [
        ` vpi-flex ${this.raised ? "vpi-shadow-md" : ""} vpi-${
          this.shape
        } ${outline} vpi-relative vpi- vpi-space-x-2 vpi-max-h-max vpi- vpi- vpi-items-center vpi-max-w-md vpi- vpi-min-w-sm vpi-py-2`
      ];
    }
  },

  methods: {
    renderDropdown() {
      return h(
        "div",
        {
          class:
            "vpi-flex vpi-p-2 vpi-flex vpi-items-center vpi-justify-center vpi-w-16",

          onClick: (e: Event) => {
            this.showDropdown = !this.showDropdown;
            this.$emit("click-dropdown", e, this.showDropdown);
          }
        },
        {
          default: () => {
            return [
              h(
                "div",
                { class: " " },
                {
                  default: () => {
                    return [
                      h("img", {
                        class: "vpi-h-4 vpi-w-6 vpi-mr-2",
                        src: getFlag(this.selectedCountry?.code)
                      }),
                      this.showDropdown
                        ? h(
                            Transition,
                            { name: "slide" },
                            {
                              default: () => {
                                return this.renderItems();
                              }
                            }
                          )
                        : ""
                    ];
                  }
                }
              ),
              this.renderCaret()
            ];
          }
        }
      );
    },

    renderItems() {
      return h(
        "ul",
        { class: dropdownClasses },
        countries
          .filter((country: Country) => {
            return country.callCode !== null;
          })
          .map((country: Country) => this.renderItem(country))
      );
    },

    renderItem(country: Country) {
      return h(
        "li",
        {
          class:
            " vpi-p-1  vpi-flex vpi-space-x-2 vpi-items-center vpi-w-full vpi-text-blue-600 vpi-cursor-pointer hover:vpi-bg-blue-200",
          onClick: (e: Event) => {
            this.selectedCountry = country;
            this.showDropdown = false;
            this.$emit("change-country", e, this.selectedCountry);

            const phoneNumber = asYoutType(
              `+${this.selectedCountry?.callCode}${this.modelValue
                ?.nationalNumber || "0000000000"}`
            );
            if (!this.modelValue?.nationalNumber && phoneNumber) {
              phoneNumber.nationalNumber = "";
            }
            this.onInput(phoneNumber);
          }
        },
        {
          default: () => {
            return this.$slots.item
              ? this.$slots.item(country)
              : [
                  h("img", {
                    class: "vpi-h-4 vpi-w-6 vpi-mr-2",
                    src: getFlag(country.code)
                  }),
                  h(
                    "span",
                    { class: "vpi-px-2 vpi-mr-2 vpi-text-gray-600" },
                    `${country.name} (${country.nativeName}) `
                  ),
                  `+${country.callCode}`
                ];
          }
        }
      );
    },

    renderInput() {
      return h("input", {
        id: this.$attrs.id,
        class:
          "vpi-p-1 vpi-w-full vpi-min-w-md vpi-bg-transparent vpi-outline-none",
        placeholder: this.placeholder,
        onClick: (e: Event) => {
          e.stopPropagation();
        },

        onFocus: (e: Event) => {
          this.focused = true;
          this.$emit("focus", e);
        },
        onBlur: (e: Event) => {
          this.focused = false;
          this.$emit("blur", e);
        },
        onInput: (e: any) => {
          let notFound = false;
          let phoneNumber = asYoutType(
            `+${this.selectedCountry?.callCode}${e.target.value}`
          );
          if (!phoneNumber) {
            notFound = true;
            phoneNumber = asYoutType(
              `+${this.selectedCountry?.callCode}00000000`
            );
          }
          if (notFound && phoneNumber) {
            phoneNumber.nationalNumber = e.target.value;
          }
          this.onInput(phoneNumber);
        },

        value: this.modelValue?.nationalNumber
      });
    },
    onInput(phoneNumber: IPhoneNumber | undefined) {
      this.$emit("update:modelValue", {
        number: phoneNumber?.number,
        nationalNumber: phoneNumber?.nationalNumber,
        callingCode: phoneNumber?.countryCallingCode,
        isValid: phoneNumber?.isValid(),
        isEqual: phoneNumber?.isEqual
      });
    },
    renderCaret() {
      return h(
        "svg",
        {
          height: 20,
          width: 20,
          viewBox: "0 0 32 32",
          class: "vpi-fill-current"
        },
        h("path", { d: "M24 12L16 22 8 12z" })
      );
    }
  },
  render() {
    return h(
      "div",
      {
        class: [
          ...this.wrapperClasses,
          this.showDropdown || this.focused
            ? " vpi-border-2 vpi-border-blue-500"
            : ""
        ]
      },
      [this.renderDropdown(), this.renderInput()]
    );
  },
  created() {
    document.addEventListener("click", e => {
      this.showDropdown = this.$el.contains(e.target);
    });

    if (this.modelValue && this.modelValue.number) {
      let num: any;
      if (this.modelValue.number) {
        num = asYoutType(this.modelValue?.number.toString());
      } else if (
        this.modelValue.nationalNumber &&
        this.modelValue.countryCallingCode
      ) {
        num = asYoutType(
          this.modelValue.countryCallingCode +
            this.modelValue?.nationalNumber.toString()
        );
      }
      this.selectedCountry = this.countries.find(country => {
        return num?.country === country.code;
      });
    } else {
      fetch("https://ip2c.org/s")
        .then(res => {
          return res.text();
        })
        .then(data => {
          const code = data.split(";")[1];
          this.selectedCountry = this.countries.find(country => {
            return code === country.code;
          });
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mounted() {},
  beforeUnmount() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    document.removeEventListener("click", () => {});
  }
});
